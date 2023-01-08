<template>

    <span v-if="'root' !== uuid">

      <template v-if="tool">

        <span :title="name">

            <span class="tool">
              <!--<Icon :name="icon" size="24" class="text-gray-800" v-if="icon"/-->
              <span v-if="icon">{{ icon }}</span>
              <span v-else>{{ toolProps.inputType }}</span>
            </span>

            <!-- Show name if while dragging tool is in dropArea -->
            <span class="component">{{ name }}</span>
          </span>

      </template>

      <template v-else>
        {{ name }}
      </template>


      <!--    <span class="font-mono text-xs" v-if="!tool">[{{ uuid }}]</span>-->

    </span>

</template>


<style scoped>
.tool,
.component {
  @apply hidden
}

.toolItem .tool {
  @apply block
}
.dropArea .component {
  @apply block
}
.dropArea .tool {
   @apply hidden
 }
</style>

<script setup>
import { computed } from 'vue'

const props = defineProps(['uuid', 'tool', 'toolType', 'toolProps', 'properties'])

const toolTypes = {
  group: {name: 'Group', icon: 'mdi:crop-landscape'},
  flexRow: {name: 'Horizontal Layout', icon: 'mdi:land-rows-vertical'},
  flex: {name: 'Vertical Layout', icon: 'mdi:land-rows-horizontal'},
  tabs: {name: 'Tabs',icon:'mdi:tab-plus'},
  tab: {name: 'Tab'},
};

const name = computed(() => {
  let label = '';
  if(props.properties?.label) {
    switch (props.toolType) {
      case 'group':
      case 'tab':
        return props.properties.label;
      default:
        label = props.properties.label;
    }
  }

  return (toolTypes[props.toolType]?.name ?? props.toolType ?? props.properties.propertyName ?? props.toolProps.inputType) + (label && ' '+ label);
});

const icon = computed(() => {
  return toolTypes[props.toolType]?.icon ?? null;
});

</script>
