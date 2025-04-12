let player, audioContext;

export function initAudioPlayer() {
	player = new WebAudioFontPlayer();

	let AudioContextFunc = window.AudioContext || window?.webkitAudioContext;
	audioContext = new AudioContextFunc();
	player = new WebAudioFontPlayer();
	player.loader.decodeAfterLoading(audioContext, '_tone_0000_SBLive_sf2');
}

export function play(note, time=0, volume=1.0) {
	if (time == -1) time = 0;
	else time += audioContext.currentTime;

	player.queueWaveTable(audioContext, audioContext.destination,
		_tone_0000_SBLive_sf2, time, note, 2, volume);
	return false;
}

export function stopAllNotes() {
	player.cancelQueue(audioContext);
}