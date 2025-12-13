import { Webhook, WebhookRequiredHeaders } from "svix";
import { headers } from "next/headers";
import { IncomingHttpHeaders } from "http";
import { NextResponse } from "next/server";

import {
  addMemberToCommunity,
  createCommunity,
  deleteCommunity,
  removeUserFromCommunity,
  updateCommunityInfo,
} from "@/lib/actions/community.actions";

import ProcessedEvent from "../../../../lib/models/event.model";
import { connectToDB } from "../../../../lib/db";

type EventType =
  | "organization.created"
  | "organizationInvitation.created"
  | "organizationMembership.created"
  | "organizationMembership.deleted"
  | "organization.updated"
  | "organization.deleted";

type Event = {
  data: Record<string, any>;
  object: "event";
  type: EventType;
};

export const POST = async (request: Request) => {
  const payload = await request.json();
  const header = headers();

  const heads = {
    "svix-id": header.get("svix-id"),
    "svix-timestamp": header.get("svix-timestamp"),
    "svix-signature": header.get("svix-signature"),
  };

  const svixId = heads["svix-id"];
  if (!svixId) {
    return NextResponse.json({ message: "Missing svix ID" }, { status: 400 });
  }

  await connectToDB(); // DB connection

  const alreadyProcessed = await ProcessedEvent.findOne({ eventId: svixId });
  if (alreadyProcessed) {
    console.log("Duplicate webhook ignored:", svixId);
    return NextResponse.json({ message: "Duplicate ignored" }, { status: 200 });
  }

  const wh = new Webhook(process.env.NEXT_CLERK_WEBHOOK_SECRET || "");
  let evnt: Event | null = null;

  try {
    evnt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders
    ) as Event;
  } catch (err) {
    return NextResponse.json({ message: err }, { status: 400 });
  }

  const eventType: EventType = evnt?.type!;

  // Mark event as processed before doing work
  await ProcessedEvent.create({ eventId: svixId });

  // Listen organization creation event
  if (eventType === "organization.created") {
    console.log("Evnt Data: ", evnt?.data);
    const { id, name, slug, logo_url, image_url, created_by } =
      evnt?.data ?? {};

    try {
      await createCommunity(
        id,
        name,
        slug,
        logo_url || image_url,
        `${name} community`,
        created_by
      );

      await addMemberToCommunity(id, created_by);

      return NextResponse.json({ message: "User created" }, { status: 201 });
    } catch (err) {
      console.log(err);
      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  // Listen organization invitation creation event.
  if (eventType === "organizationInvitation.created") {
    try {
      console.log("Invitation created", evnt?.data);

      return NextResponse.json(
        { message: "Invitation created" },
        { status: 201 }
      );
    } catch (err) {
      console.log(err);

      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  // Listen organization membership (member invite & accepted) creation
  if (eventType === "organizationMembership.created") {
    try {
      const { organization, public_user_data } = evnt?.data;
      console.log("created", evnt?.data);
      console.log("Organization: ", organization);
      console.log("Public_User_Data", public_user_data);

      await addMemberToCommunity(organization.id, public_user_data.user_id);

      return NextResponse.json(
        { message: "Invitation accepted" },
        { status: 201 }
      );
    } catch (err) {
      console.log(err);

      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  // Listen member deletion event
  if (eventType === "organizationMembership.deleted") {
    try {
      const { organization, public_user_data } = evnt?.data;
      console.log("removed", evnt?.data);

      await removeUserFromCommunity(public_user_data.user_id, organization.id);

      return NextResponse.json({ message: "Member removed" }, { status: 201 });
    } catch (err) {
      console.log(err);

      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  // Listen organization updation event
  if (eventType === "organization.updated") {
    try {
      const { id, logo_url, name, slug } = evnt?.data;
      console.log("updated", evnt?.data);

      await updateCommunityInfo(id, name, slug, logo_url);

      return NextResponse.json({ message: "Member removed" }, { status: 201 });
    } catch (err) {
      console.log(err);

      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }

  // Listen organization deletion event
  if (eventType === "organization.deleted") {
    try {
      const { id } = evnt?.data;
      console.log("deleted", evnt?.data);

      await deleteCommunity(id);

      return NextResponse.json(
        { message: "Organization deleted" },
        { status: 201 }
      );
    } catch (err) {
      console.log(err);

      return NextResponse.json(
        { message: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
};
