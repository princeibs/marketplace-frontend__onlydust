import { format } from "date-fns";
import { useMemo } from "react";

import { ProfileBoolean } from "app/migration/settings/billing/[id]/general-information/component/profile-boolean/profile-boolean";
import { ProfileItemGrid } from "app/migration/settings/billing/[id]/general-information/component/profile-item-grid/profile-item-grid";
import { ProfileItem } from "app/migration/settings/billing/[id]/general-information/component/profile-item/profile-item";
import { TProfileIndividual } from "app/migration/settings/billing/[id]/general-information/features/profile/profile-individual/profile-individual.types";

import { Translate } from "components/layout/translate/translate";

export function ProfileIndividual({ profile }: TProfileIndividual.Props) {
  const birthdate = useMemo(() => {
    if (profile.birthdate) {
      return format(new Date(profile.birthdate), "MMM dd, yyyy");
    }
    return profile.birthdate;
  }, [profile]);

  const validUntil = useMemo(() => {
    if (profile.validUntil) {
      return format(new Date(profile.validUntil), "MMM dd, yyyy");
    }
    return profile.validUntil;
  }, [profile]);

  return (
    <ProfileItemGrid>
      <ProfileItem label="v2.pages.settings.billing.information.kyc.firstName">{profile.firstName}</ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.information.kyc.lastName">{profile.lastName}</ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.information.kyc.birthdate">{birthdate}</ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.information.kyc.address">{profile.address}</ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.information.kyc.country">{profile.country}</ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.information.kyc.usCitizen">
        <ProfileBoolean value={profile.usCitizen} />
      </ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.information.kyc.identityDocumentType">
        {profile.idDocumentType ? (
          <>
            <Translate token={`v2.commons.enums.me.idDocumentType.${profile.idDocumentType}`} />
            {profile.idDocumentCountryCode ? (
              <span className="uppercase">&nbsp;({profile.idDocumentCountryCode})</span>
            ) : null}
          </>
        ) : null}
      </ProfileItem>
      <ProfileItem label="v2.pages.settings.billing.information.kyc.validUntil">{validUntil}</ProfileItem>
    </ProfileItemGrid>
  );
}
