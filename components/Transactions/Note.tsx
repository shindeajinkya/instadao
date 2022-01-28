import React, { useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { Transaction } from "../../contracts";
import { saveNote } from "../../utils/firebaseQueries";
import Button from "../Button";

const Note = ({ txn }: { txn: Transaction }) => {
	const [editingToggle, setEditingToggle] = React.useState(false);
	const [note, setNote] = React.useState(txn.message);
	const textRef = useRef<HTMLTextAreaElement | null>(null);
	const [loading, setLoading] = React.useState(false);

	const handleSaveNote = async () => {
		try {
			setLoading(true);
			await saveNote(txn.id, note);
			toast.success("Note saved successfully");
			setEditingToggle(false);
		} catch (error) {
			console.error(error);
			toast.error(error.message);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (editingToggle && textRef.current) {
			textRef.current.focus();
		}
	}, [editingToggle]);

	return (
		<div className="rounded-md">
			<div onClick={() => setEditingToggle(true)}>
				<textarea
					ref={textRef}
					value={note}
					placeholder="Add note"
					disabled={!editingToggle}
					className={`w-full rounded-md border-none border-transparent outline-none -mx-2 p-2 ${
						editingToggle
							? "bg-white resize-y"
							: "bg-transparent cursor-pointer resize-none"
					}`}
					onChange={(e) => setNote(e.target.value)}
				/>
			</div>
			{editingToggle && (
				<div className="flex items-center justify-start space-x-2 mt-2">
					<Button
						loading={loading}
						onClick={handleSaveNote}
						variant="secondary"
					>
						Save
					</Button>
					<Button
						variant="secondary"
						onClick={() => {
							setNote(txn.message);
							setEditingToggle(false);
						}}
					>
						Cancel
					</Button>
				</div>
			)}
		</div>
	);
};

export default Note;
