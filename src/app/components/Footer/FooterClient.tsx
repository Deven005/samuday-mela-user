"use client";
import useFCM from "@/app/hooks/useFCM";

interface FooterClientPropType {
  userId: string | null | undefined;
}

const FooterClient = ({ userId }: FooterClientPropType) => {
  if (userId) {
    useFCM(userId);
  }

  return <></>;
};

export default FooterClient;
