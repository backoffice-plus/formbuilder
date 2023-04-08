<template>

  <div class="tabs">
    <button
        v-for="key in availableTabs"
        @click="showBar=key;"
        :class="{active:key===showBar}"
        v-text="key"
    />

    <!--    <button @click="showBar='schema';" :class="{active:'schema'===showBar}" v-if="!schemaReadOnly">Controls</button>-->
    <!--    <button @click="showBar='uischema';" :class="{active:'uischema'===showBar}" v-if="showBuilder==='uischema'">Layout</button>-->
    <!--    <button @click="showBar='properties';" :class="{active:'properties'===showBar}" v-if="schemaReadOnly">Properties</button>-->
  </div>

  <FormBuilderBar
      :tools="getFilteredTools"
      @drag="e=>emits('drag',e)"
  />

</template>

<style scoped>
.tabs {
  @apply
  flex gap-2
}

.tabs > button {
  @apply
  p-1 px-4
  rounded-t
}

.tabs > button.active {
  background-color: var(--toolBar-tab);
}

.tabs > button:hover {
  background-color: var(--toolBar-tab-hover);
}

</style>


<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {getFormbuilder, getToolDraggingRef} from "../lib/vue";
import FormBuilderBar from "./FormBuilderBar.vue";


const props = defineProps(
    {
      toolFinder: {type: Object, require: true},
      schemaOnly: {type: Boolean, require: true},
      schemaReadOnly: {type: Boolean, require: true},
      showBuilder: {type: String, require: true},
    }
);

watch(props.showBuilder, () => {

  console.log("watch props.showBuilder", props.showBuilder)
});

const fb = getFormbuilder();
const toolDragging = getToolDraggingRef();

const emits = defineEmits(['drag']);

const showBar = ref('control');

const typedTools = props.toolFinder.getTypedTools();

const availableTabs = computed(() => {
  const availableTabs = Object.keys(typedTools)
      .filter(key => typedTools[key].length > 0)
      .filter(key => {

        //schema mode
        if (props.schemaOnly) {
          return 'control' === key; //only control tools in schemaOnly mode
        }

        //ui mode
        //-- show ui
        //-- show schema
        //-- schemaReadOnly
        else {
          if ('schema' === props.showBuilder) {
            return 'control' === key; //only control tools on schemaBuilderView
          }
        }

        return true;
      })

  if (!availableTabs.includes(showBar.value)) {
    showBar.value = availableTabs[0];
  }

  return availableTabs;
})

const getFilteredTools = computed(() => {
    return (typedTools[showBar.value] ?? []).filter(tool => {
      return !tool.toolbarOptions()?.hideToolAtBar
    })
})

</script>

