<template>

  <section>
    <button
        v-for="key in availableTabs"
        @click="showBar=key;"
        :class="{active:key===showBar}"
    >
        {{ key }}
        <span v-if="'unscoped' === key">({{ unscopedTools?.length }})</span>
    </button>
    <!--    <button @click="showBar='schema';" :class="{active:'schema'===showBar}" v-if="!schemaReadOnly">Controls</button>-->
    <!--    <button @click="showBar='uischema';" :class="{active:'uischema'===showBar}" v-if="showBuilder==='uischema'">Layout</button>-->
    <!--    <button @click="showBar='properties';" :class="{active:'properties'===showBar}" v-if="schemaReadOnly">Properties</button>-->
  </section>

  <FormBuilderBar
      :tools="getFilteredTools"
      @drag="e=>emits('drag',e)"
  />

</template>

<style scoped>
section {
  @apply
  flex gap-2
}

section > button {
  @apply
  p-1 px-4
  rounded-t
}

section > button.active {
  background-color: var(--toolBar-tab);
}

section > button:hover {
  background-color: var(--toolBar-tab-hover);
}

</style>


<script setup>
import {computed, onMounted, ref, watch} from 'vue';
import {getFormbuilder, getToolDraggingRef} from "../lib/vue";
import FormBuilderBar from "./FormBuilderBar.vue";
import {findUnscopedTools} from "../lib/formbuilder";


const props = defineProps(
    {
      toolFinder: {type: Object, require: true},
      schemaOnly: {type: Boolean, require: true},
      schemaReadOnly: {type: Boolean, require: true},
      showBuilder: {type: String, require: true},
    }
);

// watch(props.showBuilder, () => {
//
//   console.log("watch props.showBuilder", props.showBuilder)
// });

const fb = getFormbuilder();
const toolDragging = getToolDraggingRef();

const emits = defineEmits(['drag']);

const showBar = ref('control');

const typedTools = props.toolFinder.getTypedTools();
const unscopedTools = ref([]);
typedTools.unscoped = unscopedTools

if(props.schemaReadOnly) {
    const fb = getFormbuilder();
    const baseSchemaTool= fb?.exposed?.baseSchemaTool?.value;
    typedTools.control = baseSchemaTool.initChilds(props.toolFinder);
}


const availableTabs = computed(() => {
  typedTools.unscoped.value = findUnscopedTools(fb?.exposed?.baseSchemaTool?.value);

  const availableTabs = Object.keys(typedTools)
      .filter(key => {
          const tools = typedTools[key]?.value ?? typedTools[key] ?? [];
          return tools.length > 0
      })
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
    const tools = typedTools[showBar.value]?.value ?? typedTools[showBar.value] ?? [];
    return tools.filter(tool => {
      return !tool.toolbarOptions()?.hideToolAtBar
    })
})

</script>

