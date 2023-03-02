<script setup>
import { ref, computed } from 'vue'
import AppFormbuilder from './AppFormbuilder.vue'
import AppJsonforms from './AppJsonforms.vue'
import {getUrl} from "./lib";

const routes = {
  '/': AppFormbuilder,
  '/jsonforms': AppJsonforms
}

const currentPath = ref(getUrl().pathname)
const currentView = computed(() => routes[currentPath.value] ?? AppFormbuilder);

window.addEventListener('hashchange', () => {
  currentPath.value = getUrl().pathname;
})

import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)


</script>

<style>
body {
  color: #1b2931;
  background-color: #f3f4f5;
  --toolBar-bg:#f3f4f5;
}
.dark body {
  color: #e3e8e8;
  background-color: #242526;
  --toolBar-bg:#242526;
}
.card {
 @apply bg-white rounded shadow
}

.dark .card {
  background-color: rgb(200,200,200,0.15);
}


.dark {
  --base-100: hsl(0 0% 35%);
  --base-200: hsl(0 0% 25%);
  --base-300: hsl(0 0% 15%);

  --tool-control: #606e80;
  --tool-control-secondary: #6f8075;
  --tool-layout: #6e7580;
  --tool-accent: #4d493c;
  --tool-error: #4d4444;
  --toolItem-icon:#fff;
  --toolItem-border:rgb(100,100,100,0.6);
  --modal:var(--base-100);

  --dropArea: var(--base-200);
  --dropArea-dots: var(--base-100);
  --dropArea-dragBorder: var(--base-100);

  --buttonRounded-hover:rgba(200,200,200,.2);

  --tool-categorization-tab-hover:rgb(255,255,255,0.2);
  --tool-control-input: rgb(255,255,255,0.3);
  --tool-control-input-border: rgb(0,0,0,0.5);
}

.dark .styleA {
  --text-color:rgba(200,200,200, 0.8);
  --text-color-light:rgba(200,200,200, 0.9);
  --text-color-description: rgba(200,200,200, 0.7);
  --text-color-focused: rgba(220,220,220, 0.9);

  --bg: #414040;
  --bg-button:rgba(150,150,150, 0.5);
  --bg-disabled:rgba(150,150,150, 0.7);

  --border:rgba(150,150,150, 0.5);
  --border-focus:rgba(150,150,150, 0.9);
  --tabs-border-activ:var(--text-color-focused)
}

</style>

<template>
  <button @click="toggleDark()">
    Is Dark: {{ isDark }}
  </button>

  <component :is="currentView" />
</template>
