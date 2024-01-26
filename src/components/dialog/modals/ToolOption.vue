<template>
  <article class="p-4">

    <h2>Optionen</h2>

    <JsonFormsSubmittable
      :jsonforms="jf"
      :data="options"
      v-if="jf?.schema"
      @changed="onChange"
      @submit="onSubmit"
    />

    <div v-if="error" class="errorMsg">{{error}}</div>

  </article>
</template>

<style scoped>
article {
  --width: clamp(400px, calc(100vw - 5%), 800px);
  --height: clamp(200px, 95%, 600px);

  min-width: 800px;
  min-height: 800px;
}
</style>

<script setup lang="ts">
import {onMounted, ref} from "vue";
import {getFormbuilder} from "@/lib";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "@/lib";
import JsonFormsSubmittable from "@/components/JsonFormsSubmittable.vue";

const props = defineProps<{
  tool: ToolInterface,
}>()
const emit = defineEmits<{
  (name: 'submit', payload:any): void,
}>()

const fb = getFormbuilder();
const context:ToolContext = {
  fb:fb,
  parentMethod:'modalcontent.onchange',
  builder: fb?.exposed?.showBuilder?.value,
  schemaReadOnly: !!fb?.props?.schemaReadOnly,
}

const options = ref({});
const jf = ref<JsonFormsInterface|undefined>();
const error = ref('');

const createJsonforms = () => {

  const context:ToolContext = {
    fb: fb,
    builder: fb?.exposed?.showBuilder.value,
    schemaOnly: !!fb?.props?.schemaOnly,
    schemaReadOnly: !!fb?.props?.schemaReadOnly,
    rootSchema: fb?.exposed?.rootSchema?.value,
    baseSchemaTool: fb?.exposed?.baseSchemaTool?.value,
  }

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


/**
 * Autosave is disabled for now
 */
const onChange = (data:any) => {
  // const dataNoRef = JSON.parse(JSON.stringify(data)); //:TODO other way to remove ref/proxy?
  //
  // props.tool.optionDataUpdate(context, dataNoRef)
  //
  // emit('submit', data);
}

const onSubmit = (data:any) => {
  const dataNoRef = JSON.parse(JSON.stringify(data)); //:TODO other way to remove ref/proxy?

  props.tool.optionDataUpdate(context, dataNoRef)

  emit('submit', dataNoRef)
}


onMounted(async () => {
  createJsonforms();
})
</script>
