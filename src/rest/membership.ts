import {
  CANNOT_DELETE_SOLE_MEMBER,
  CANNOT_DELETE_SOLE_OWNER,
  CANNOT_UPDATE_SOLE_OWNER,
  INSUFFICIENT_PERMISSION,
  MEMBERSHIP_NOT_FOUND
} from "@staart/errors";
import {
  deleteMembership,
  getMembership,
  getMembershipDetailed,
  getOrganizationMembers,
  updateMembership
} from "../crud/membership";
import { can } from "../helpers/authorization";
import { ApiKeyResponse } from "../helpers/jwt";
import { trackEvent } from "../helpers/tracking";
import { Authorizations, EventType, MembershipRole } from "../interfaces/enum";
import { KeyValue, Locals } from "../interfaces/general";

export const getMembershipDetailsForUser = async (
  userId: string,
  membershipId: string
) => {
  if (await can(userId, Authorizations.READ, "membership", membershipId))
    return getMembershipDetailed(membershipId);
  throw new Error(INSUFFICIENT_PERMISSION);
};

export const deleteMembershipForUser = async (
  tokenUserId: string | ApiKeyResponse,
  membershipId: string,
  locals: Locals
) => {
  const membership = await getMembership(membershipId);
  if (!membership || !membership.id) throw new Error(MEMBERSHIP_NOT_FOUND);
  if (await can(tokenUserId, Authorizations.DELETE, "membership", membership)) {
    const organizationMembers = await getOrganizationMembers(
      membership.organizationId
    );
    if (membership.role == MembershipRole.OWNER) {
      const currentMembers = organizationMembers.filter(
        member => member.role == MembershipRole.OWNER
      );
      if (currentMembers.length < 2) throw new Error(CANNOT_DELETE_SOLE_OWNER);
    }
    if (organizationMembers.length === 1)
      throw new Error(CANNOT_DELETE_SOLE_MEMBER);
    trackEvent(
      {
        userId: membershipId,
        type: EventType.MEMBERSHIP_DELETED
      },
      locals
    );
    await deleteMembership(membership.id);
    return;
  }
  throw new Error(INSUFFICIENT_PERMISSION);
};

export const updateMembershipForUser = async (
  userId: string | ApiKeyResponse,
  membershipId: string,
  data: KeyValue,
  locals: Locals
) => {
  if (await can(userId, Authorizations.UPDATE, "membership", membershipId)) {
    const membership = await getMembership(membershipId);
    if (data.role != membership.role) {
      if (membership.role == MembershipRole.OWNER) {
        const organizationMembers = await getOrganizationMembers(
          membership.organizationId
        );
        const currentMembers = organizationMembers.filter(
          member => member.role == MembershipRole.OWNER
        );
        if (currentMembers.length < 2)
          throw new Error(CANNOT_UPDATE_SOLE_OWNER);
      }
    }
    trackEvent(
      {
        userId: membershipId,
        type: EventType.MEMBERSHIP_UPDATED
      },
      locals
    );
    await updateMembership(membershipId, data);
    return;
  }
  throw new Error(INSUFFICIENT_PERMISSION);
};
