import React from "react";
import Image from "next/image";
import instadao from "../../assets/instadaologo.svg";

const Logo: React.FC<{ isWhite?: boolean }> = ({ isWhite = false }) => {
  return <Image src={instadao} />;
};

export default Logo;
