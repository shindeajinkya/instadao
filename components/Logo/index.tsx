import React from "react";
import Image from "next/image";
import wallet from "../../assets/Wallet.svg";
import cryptocoffeewhite from "../../assets/cryptocoffeewhite.svg";
import cryptocoffee from "../../assets/cryptocoffee.svg";
import cryptocoffeecup from "../../assets/cryptocoffeecup.svg";

const Logo: React.FC<{ isWhite?: boolean }> = ({ isWhite = false }) => {
	return (
		<>
			{/* <div className={`${isWhite ? 'hidden' : 'hidden xs:block'}`}>
				<Image 
					src={cryptocoffeecup}
				/>
			</div>
			<div className={`${isWhite ? '' : 'xs:hidden'}`}>
				<Image
					height={34}
					width={87}
					src={isWhite ? cryptocoffeewhite : cryptocoffee}
				/>
			</div> */}
            <div>
                <Image src={wallet} />
            </div>
		</>
	);
};

export default Logo;
