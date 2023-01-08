<template>

  <div class="absolute right-0 top-0" v-if="'root' !== uuid">
    <button type="button" class="roundForIcons small" @click="emit('gear')">
      <Icon name="mdi:gear"></Icon>
    </button>
    <button type="button" class="roundForIcons small hover:bg-red-300 hover:text-red-600" @click="emit('delete')">
      <Icon name="mdi:trash"></Icon>
    </button>
  </div>

</template>


<style scoped>

</style>

<script setup>

const props = defineProps(['uuid'])
const emit = defineEmits(['gear', 'delete'])

</script>
