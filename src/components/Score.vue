<template>
  <div id="osmdContainer" @click="click"></div>
</template>

<script lang="ts" setup>
import { GraphicalNote, Note, OpenSheetMusicDisplay, PointF2D } from 'opensheetmusicdisplay';
import { onMounted, Ref, ref } from 'vue';

import { initAudioPlayer, play, stopAllNotes } from '@/audioPlayer.js';

let osmd: OpenSheetMusicDisplay | null = null;

onMounted(() => {
  osmd = new OpenSheetMusicDisplay('osmdContainer');
  osmd.setOptions({
    backend: "svg",
    drawTitle: true,
    // drawingParameters: "compacttight" // don't display title, composer etc., smaller margins
  });

  osmd.load('/scores/Waltz_in_A_MinorChopin.mxl').then(() => {
    if (!osmd) return;

    osmd.render();

    document.title = `${osmd.GraphicSheet.Title.Label.text} - ${osmd.GraphicSheet.Composer.Label.text}`;

    let cursor = osmd.cursor;
    cursor.show();

    // const cursorVoiceEntry = cursor.Iterator.CurrentVoiceEntries[0];
    // const lowestVoiceEntryNote = cursorVoiceEntry.Notes[0];
    // console.log("Stem direction of VoiceEntry under Cursor: " + cursorVoiceEntry.StemDirection);
    // console.log("base note of Voice Entry at second cursor position: " + lowestVoiceEntryNote.Pitch.ToString());

    // while (cursor.Iterator.CurrentMeasureIndex != 5) cursor.next();
  });

  initAudioPlayer();
});

const playing: Ref<boolean> = ref(false);
const cursorTimers: ReturnType<typeof setTimeout>[] = [];

function moveCursorToNote(note: Note) {
  if (!osmd) return;

  osmd.cursor.reset();
  for (let i = 0; i < 10000; i++) {
    if (osmd.cursor.Iterator.CurrentVoiceEntries.some(
        ent => ent.Notes?.includes?.(note))) {
      break;
    }
    osmd.cursor.next();
  }
}

function setCursorTick(note: Note, time: number) {
  cursorTimers.push(
    setTimeout(() => {
      moveCursorToNote(note);
    }, time * 1E3)
  );
}

function clearCursorTicks() {
  cursorTimers.forEach(t => clearTimeout(t));
}

const click = (event: MouseEvent) => {
  if (!osmd) return;

  // Identify clicked note
  const p = new PointF2D(event.offsetX / 10, event.offsetY / 10);
  const radius = new PointF2D(1, 1);
  const note = osmd.GraphicSheet.GetNearestNote(p, radius);
  if (!note) return;

  // Move cursor to clicked note
  moveCursorToNote(note.sourceNote);

  // Silence previous notes
  stopAllNotes();
  clearCursorTicks();

  // Play notes from here
  const playCursor = osmd.Cursor;
  let startTime = undefined;
  for (let i = 0; i < 400; i++) {
    if (startTime === undefined) startTime = playCursor.Iterator.CurrentEnrolledTimestamp.realValue;
    const time = playCursor.Iterator.CurrentEnrolledTimestamp.realValue - startTime;
    const measureTime = 4 / (playCursor.Iterator.CurrentMeasure.TempoInBPM / 60);

    if (!playCursor.Iterator.CurrentVoiceEntries) break;

    setCursorTick(playCursor.Iterator.CurrentVoiceEntries?.[0]?.Notes?.[0], time * measureTime);
    playCursor.Iterator.CurrentVoiceEntries.forEach(ve => {
      ve.Notes.forEach(note => {
        if (note?.isRestFlag) return;
        play(note.halfTone, time * measureTime, 0.3);
      });
    });
    playCursor.next();
  }
  playing.value = true;
};
</script>

<style scoped lang="scss">
</style>
