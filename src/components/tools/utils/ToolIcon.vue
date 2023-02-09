<template>

  <div class="flex items-center gap-1">

    <slot name="icon">
      <Icon :icon="toolOptions.icon" v-if="toolOptions.icon"/>
      <span v-else v-text="toolOptions.title" />
    </slot>


    <template v-if="isToolbar">
        <label class="labelAtBar"></label>
        <label class="labelAtDropArea">{{ toolOptions?.labelAtDropArea }}</label>
    </template>


    <template v-else>

      <slot name="droparea">
        <div class="flex gap-2 items-center">
          <label>{{ toolOptions.title }}</label>
        </div>
      </slot>

    </template>
  </div>


</template>


<style scoped>
.toolItem .labelAtBar,
.dropArea .labelAtDropArea {
  @apply inline
}
.labelAtBar, .labelAtDropArea,
.dropArea .labelAtBar {
  @apply hidden
}

.toolItem svg.iconify {
  height:24px;
  width:24px;
}
.dropArea svg.iconify {
  height:22px;
  width:22px;
}
</style>

<script setup>
import {computed} from 'vue'
import {Icon} from "@iconify/vue";

const props = defineProps({
  tool: Object,//ToolInterface
  isToolbar: Boolean,
})

const toolOptions = computed(() => (props?.tool.toolbarOptions && props?.tool.toolbarOptions()) ?? {});

</script>
