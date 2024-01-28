<template>

  <footer>
    <button type="button" @click="emit('add')" v-if="showAdd"><Icon icon="mdi:plus" /></button>
    <slot></slot>
  </footer>

</template>


<style scoped>
footer {
  width: auto;
  @apply
  absolute bottom-0 left-0 right-0
  flex justify-center items-center

  transition-opacity duration-300
}

footer > button {
  color:var(--toolItem-icon);
  @apply
  p-1

  flex justify-center items-center
  h-6 w-6

  rounded-full

  transition-colors

}
footer > button:hover {
  background-color: var(--buttonRounded-hover);
}

.HorizontalLayout > footer {
  top:0;
  bottom:0;
  right:0;
  left:unset;
}
</style>


<style>
:where(.rootItem, .dropItem) > div > .dropArea > footer {
  @apply opacity-0
}
:where(.rootItem, .dropItem):hover > div > .dropArea > footer {
  @apply opacity-100
}
</style>



<script setup>
import {Icon} from "@iconify/vue";
import {showToolOptions, getFormbuilder} from "@/lib";

const props = defineProps(
    {
      tool: {type:Object,require:true},
      showAdd: {type:Boolean,default:true},
    }
)
const emit = defineEmits(['add'])


</script>
