<template>

  <div>
    <div :class="'styleA'">
        <JsonForms
            :schema="jf.schema"
            :uischema="jf.uischema"
            :data="data"
            :renderers="fb?.exposed?.jsonFormsRenderers"
            :readonly="!!readonly"
            @change="onChange"
            :validationMode="validationMode"
        />

      <slot name="button" v-bind="{submit}">
        <button class="btn blue mt-4 w-full" @click="submit" :disabled="readonly"  v-if="!hideSubmit">Submit</button>
      </slot>

    </div>

    {{ errors.length ? errors : ''}}
<!--    <FormsErrors :errors="errors"/>-->
  </div>

</template>

<style scoped>

section {
    @apply p-4
}
/**
copied from ButtonRenderer
 */
  button {
    @apply
    border border-gray-400 rounded px-6 py-0.5
    bg-gray-100 hover:bg-gray-200
  }

</style>

<script setup lang="ts">
import {JsonForms} from "@jsonforms/vue";
import type {JsonFormsRendererRegistryEntry, JsonSchema, ValidationMode} from "@jsonforms/core";
import {computed, ref, watch, type Ref} from "vue";
import {type ToolInterface} from "../lib/models";
import {getFormbuilder} from "../lib/vue";

const props = defineProps<{
  jsonforms: { schema:JsonSchema, uischema:any },
  data?: Object,
  renderers?: JsonFormsRendererRegistryEntry[],
  tools?: ToolInterface[],
  readonly?: boolean,
  hideSubmit?: boolean,
}>()
const emits = defineEmits(['changed', 'submit'])

const fb = getFormbuilder()

const data = ref(props.data ?? {});
const latestEvent = ref();
const validationMode:Ref<ValidationMode> = ref('ValidateAndHide');
const errors = ref([]);

const jf = computed(() => {
  //:MAGIC ERROR reparse to avoid proxy objects (maybe it can be removed)
  return JSON.parse(JSON.stringify({
    schema: props.jsonforms.schema,
    uischema: props.jsonforms.uischema,
  }));
})

const onChange = (event:any) => {
    latestEvent.value = event;
    emits('changed', latestEvent.value.data)
}
const submit = async () => {
    errors.value = [];
    data.value = latestEvent.value.data;  //its necessary bc changinge validationMode clears form
    validationMode.value = 'ValidateAndShow';
    if (latestEvent.value.errors.length) {
        errors.value = latestEvent.value.errors.map(error => error.message)
        return;
    }

    emits('submit', data.value)
}

watch(()=>props.data,(d)=>{
  data.value = props.data;
},{deep:true})

defineExpose({submit})

</script>

