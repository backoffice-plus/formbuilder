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

<template>
  <button @click="toggleDark()">
    Is Dark: {{ isDark }}
  </button>

  <component :is="currentView" />
</template>
