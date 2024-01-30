<template>
  <article class="modalToolOptions">

    <header>
      <ToolIcon :tool="tool"/>
      <span v-if="tool.propertyName && 'object' === tool.edge.schemaParent?.schema?.type">
        "{{ tool.propertyName }}"
      </span>
    </header>

    <JsonFormsSubmittable
      :jsonforms="jf"
      :data="options"
      v-if="jf?.schema"
      @changed="onChange"
      @submit="onSubmit"
    >

      <template #button="{submit}">
        <Teleport to=".modalToolOptions footer">
          <button class="submit" @click="submit">OK</button>
        </Teleport>
      </template>

    </JsonFormsSubmittable>

    <footer></footer>

    <div v-if="error" class="errorMsg">{{error}}</div>

  </article>
</template>


<style scoped>
article {
  --width: clamp(400px, calc(100vw - 5%), 800px);
  --height: clamp(200px, 95%, 600px);

  min-width: 600px;
  min-height: 600px;

  max-width: 800px;
  max-height: 800px;

  @apply
  p-4
}

article header {
@apply flex flex-row gap-2
}

article footer {
  @apply
  flex items-center justify-center
  py-8
}

article footer button {
  width: 33%;
}

</style>


<script setup lang="ts">
import {onMounted, ref} from "vue";
import {createContext, getFormbuilder} from "@/lib";
import type {JsonFormsInterface, ToolInterface, ModalControl} from "@/lib";
import JsonFormsSubmittable from "@/components/JsonFormsSubmittable.vue";
import ToolIcon from "@/components/tools/utils/ToolIcon.vue";

const props = defineProps<{
  tool: ToolInterface,
  modalControl?: ModalControl,
}>()
const emit = defineEmits<{
  (name: 'submit', payload:any): void,
}>()

const fb = getFormbuilder();
const context = createContext(fb)
context.parentMethod = 'modalcontent.onchange';
context.modalControl = props.modalControl;


const options = ref({});
const jf = ref<JsonFormsInterface|undefined>();
const error = ref('');

const createJsonforms = () => {
  try {
    options.value = props.tool.optionDataPrepare(context);

    props.tool.optionJsonforms(context)
        .then((e:JsonFormsInterface|undefined) => {
          const jfUnref = JSON.parse(JSON.stringify(e));

          jf.value = {
            schema:jfUnref?.schema,
            uischema:jfUnref?.uischema
          };
        })
        .catch((e:any) => {
          error.value = e
        })
  }
  catch(e:any) {
    error.value = e;
  }
}

const emitChanges = (data:any) => {
  const dataNoRef = JSON.parse(JSON.stringify(data)); //:TODO other way to remove ref/proxy?

  props.tool.optionDataUpdate(context, dataNoRef)

  emit('submit', dataNoRef)
}

const onChange = (data:any) => {
  //:INFO autosave - is disabled for now
  //emitChanges(data);
}

const onSubmit = (data:any) => {
  emitChanges(data);
}


onMounted(async () => {
  createJsonforms();
})
</script>
