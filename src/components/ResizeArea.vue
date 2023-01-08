<template>

  <div class="relative" ref="resizeWrapper">

    <div class="indicator z-40"
         ref="resizeMover"
         @mousedown="startDragging()"
    ></div>

    <div ref="resizeTarget" class="relative">

      <div class="absolute inset-0 z-30" v-if="pressed" />

      <slot></slot>
    </div>

  </div>

</template>


<style scoped>
.indicator {
  transform: translate(-50%, -50%);
  width:5px;

  @apply
  absolute
  right-0 top-1/2

  h-10

  bg-gray-400
  hover:bg-gray-300

  rounded
  cursor-ew-resize
}
</style>


<script setup>

const resizeWrapper = ref(null);
const resizeMover = ref(null);
const resizeTarget = ref(null);
const { pressed } = useMousePressed({ target: resizeMover })

const handleDragging = (e) => {
  const wrapperWidth = resizeWrapper.value.clientWidth;
  if (e.offsetX >= 300 && e.offsetX <= wrapperWidth) {
    resizeMover.value.style.left = e.offsetX +"px";
    resizeTarget.value.style.width = e.offsetX +"px";
  }
  e.preventDefault();
}
const startDragging = () => document.addEventListener('mousemove', handleDragging);
const endDragging = () =>  document.removeEventListener('mousemove', handleDragging);

watch(pressed, () => {
  if(pressed.value) {
    document.body.classList.add('cursor-ew-resize');
  }
  else {
    document.body.classList.remove('cursor-ew-resize');
    endDragging();
  }
});
onMounted(() => {
  resizeMover.value.style.left = resizeTarget.value.clientWidth +"px";
})
onUnmounted(endDragging)

</script>

