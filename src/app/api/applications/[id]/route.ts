import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const application = await prisma.application.findUnique({
      where: { id: params.id },
      include: {
        jobPosting: {
          include: {
            company: true,
          },
        },
        resume: true,
        recruiters: true,
        tags: {
          include: {
            tag: true,
          },
        },
        interviews: true,
        followUps: {
          orderBy: { scheduledDate: 'desc' },
        },
        documents: true,
        events: {
          orderBy: { date: 'desc' },
        },
        statusHistory: {
          orderBy: { changedAt: 'desc' },
        },
      },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    return NextResponse.json({ application });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch application' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, notes, replyStatus, replyChannel, isGhosted, resumeId, newEvent, newFollowUp } = body;

    const existingApp = await prisma.application.findUnique({
      where: { id: params.id },
    });

    if (!existingApp) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updateData: any = {};

    if (notes !== undefined) updateData.notes = notes;
    if (replyStatus !== undefined) updateData.replyStatus = replyStatus;
    if (replyChannel !== undefined) updateData.replyChannel = replyChannel;
    if (isGhosted !== undefined) updateData.isGhosted = isGhosted;
    if (resumeId !== undefined) updateData.resumeId = resumeId;

    // If status changed, record status history log & event
    if (status && status !== existingApp.status) {
      updateData.status = status;

      await prisma.statusHistory.create({
        data: {
          applicationId: params.id,
          fromStatus: existingApp.status,
          toStatus: status,
          notes: body.statusChangeNote || `Moved to ${status}`,
        },
      });

      await prisma.applicationEvent.create({
        data: {
          applicationId: params.id,
          title: `Status Updated to ${status}`,
          description: body.statusChangeNote || `Application stage changed from ${existingApp.status} to ${status}`,
          eventType: status.includes('INTERVIEW') ? 'INTERVIEW' : status === 'OFFER' ? 'OFFER' : 'NOTE',
        },
      });

      await prisma.activityLog.create({
        data: {
          userId: existingApp.userId,
          applicationId: params.id,
          action: 'STATUS_UPDATED',
          details: `Updated status from ${existingApp.status} to ${status}`,
        },
      });
    }

    // Add new timeline event if provided
    if (newEvent) {
      await prisma.applicationEvent.create({
        data: {
          applicationId: params.id,
          title: newEvent.title,
          description: newEvent.description,
          eventType: newEvent.eventType || 'NOTE',
        },
      });
    }

    // Add new follow-up if provided
    if (newFollowUp) {
      await prisma.followUp.create({
        data: {
          applicationId: params.id,
          scheduledDate: new Date(newFollowUp.scheduledDate),
          type: newFollowUp.type || 'EMAIL',
          notes: newFollowUp.notes,
          status: 'PENDING',
        },
      });
    }

    const updatedApp = await prisma.application.update({
      where: { id: params.id },
      data: updateData,
      include: {
        jobPosting: { include: { company: true } },
        resume: true,
        events: { orderBy: { date: 'desc' } },
        statusHistory: { orderBy: { changedAt: 'desc' } },
      },
    });

    return NextResponse.json({ success: true, application: updatedApp });
  } catch (error) {
    console.error('Failed to update application:', error);
    return NextResponse.json({ error: 'Failed to update application' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.application.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete application' }, { status: 500 });
  }
}
