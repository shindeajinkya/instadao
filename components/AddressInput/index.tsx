import React, { useEffect, useRef, useState } from "react";
import { useDebounce } from "use-debounce";
import { useEnsAddress } from "../../utils/useEnsAddress";
import classnames from "classnames";
import Loader from "../Loader";

interface AddressInputProps {
	defaultValue?: string;
	onChange?: (address: string, ens?: string) => void;
}
const AddressInput: React.FC<AddressInputProps> = ({
	defaultValue,
	onChange,
}) => {
	// const [value, setValue] = useState(defaultValue || "");
	const [value, setValue] = useState(defaultValue);
	const [debouncedValue] = useDebounce(value, 1000);
	const [editable, setEditable] = useState(true);

	const inputRef = useRef<HTMLInputElement>(null!);

	const {
		name: ensAddress,
		avatar,
		error,
		address,
	} = useEnsAddress(debouncedValue);

	const handleBlur = (e) => {
		if (e.target.value === address) {
			setEditable(false);
		}
	};

	const loading = debouncedValue && !ensAddress && !error;

	useEffect(() => {
		setEditable(!address);
	}, [address]);

	useEffect(() => {
		inputRef.current?.focus();
	}, [editable]);

	useEffect(() => {
		if (!error) onChange(address, ensAddress);
		if (error) onChange("");
	}, [address, error]);

	return (
		<div className="relative flex-1">
			<div className="mt-1 relative w-full">
				{editable && (
					<input
						onChange={(e) => setValue(e.target.value)}
						onBlur={handleBlur}
						type="text"
						ref={inputRef}
						value={value}
						className={classnames(
							"shadow-sm placeholder-opacity-50  w-full block sm:text-sm rounded-md bg-white bg-opacity-10 p-2 px-4 border border-black",
							error &&
								"border border-red-500 ring-red-500 focus:ring-red-500 focus:border-red-500 ring-1",
							!error &&
								"border border-solid border-white border-opacity-20 focus:ring-indigo-500 focus:border-indigo-500"
						)}
						placeholder="Your fren's wallet address or ENS name"
					/>
				)}

				{!editable && (
					<div
						onClick={() => setEditable(true)}
						className="flex h-10 items-center bg-white bg-opacity-10 border border-solid border-white border-opacity-20 rounded-md relative cursor-pointer hover:bg-opacity-30"
					>
						{avatar && (
							<img className="h-10 w-10" src={avatar} alt="" />
						)}
						<div className=" px-2 truncate w-full">
							{ensAddress || address}
						</div>
						<span className="absolute right-4 top-1/2 -translate-y-1/2 transform text-sm text-gray-400">
							Edit
						</span>
					</div>
				)}

				{loading && (
					<span className="absolute right-4 top-1/2 -translate-y-1/2 transform">
						<Loader />
					</span>
				)}
			</div>

			{!!error?.length && (
				<span className="text-sm text-red-500 absolute bottom-0 transform translate-y-full mt-1">
					{error}
				</span>
			)}
		</div>
	);
};

export default AddressInput;
