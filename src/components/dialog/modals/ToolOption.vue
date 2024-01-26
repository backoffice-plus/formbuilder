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
import JsonFormsSubmittable from "@/components/JsonFormsSubmittable.vue";
import {getFormbuilder, type ToolInterface} from "@/lib";
import {onMounted, ref} from "vue";

const props = defineProps<{
  tool: ToolInterface,
}>()
const emit = defineEmits<{
  (name: 'submit', payload:any): void,
}>()

const fb = getFormbuilder();
const context = {
  fb:fb,
  parentMethod:'modalcontent.onchange',
  builder: fb?.exposed?.showBuilder?.value,
  schemaReadOnly: fb.props.schemaReadOnly,
}

const options = ref({});
const jf = ref({});
const error = ref('');

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

  const context = {
    fb: fb,
    builder: fb?.exposed?.showBuilder.value,
    schemaOnly: fb.props.schemaOnly,
    schemaReadOnly: fb.props.schemaReadOnly,
    rootSchema: fb?.exposed?.rootSchema?.value,
    baseSchemaTool: fb?.exposed?.baseSchemaTool?.value,
  }

  try {
    options.value = props.tool.optionDataPrepare(context);
    jf.value = await props.tool.optionJsonforms(context)
        .then(e => {
          const event = {
            tool:props.tool,
            schema: JSON.parse(JSON.stringify(e.schema)),
            uischema: JSON.parse(JSON.stringify(e.uischema)),
          };

          return {schema:event.schema, uischema:event.uischema};
        })
        .catch(e => {
          error.value = e
        })
  }
  catch(e) {
    error.value = e;
  }
})
</script>
