import { Reactive, reactive } from 'vue';

interface NoteInput {
	semitones: number;
};

export const noteInput: Reactive<NoteInput[]> = reactive([]);

export function inputEvent(event: KeyboardEvent) {
	const rows = 'zsxdcvgbhnjm,l.ö-' + 'q2w3e4rt6y7ui9o0p+å' ;
	let offs = rows.indexOf(event.key);
	if (offs == -1) return;

	const note = 4*12 + offs;
	console.log({ note, offs });

	noteInput.unshift({ semitones: note });
}