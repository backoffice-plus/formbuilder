<template>

  <div>
    <div :class="'styleA'">
        <JsonForms
            :schema="jf.schema"
            :uischema="jf.uischema"
            :data="data"
            :renderers="fb?.exposed?.jsonFormsRenderers"
            :readonly="!!readonly"
            :i18n="{translate: createI18nTranslate(formBuilderCatalogue)}"
            :validationMode="validationMode"
            @change="onChange"
        />
    </div>

    <slot name="button" v-bind="{submit}">
        <button class="submit" @click="submit" :disabled="readonly"  v-if="!hideSubmit">Submit</button>
    </slot>

    <div v-if="errorAfterUpdated" class="flex flex-col gap-1">
      <div v-for="e in errorAfterUpdated" class="errorMsg px-1">{{ e?.instancePath }}: {{e?.message}}</div>
    </div>

    {{ errors.length ? errors : ''}}
<!--    <FormsErrors :errors="errors"/>-->
  </div>

</template>



<script setup lang="ts">
import {ref, type Ref} from "vue";
import {JsonForms} from "@jsonforms/vue";
import type {JsonFormsRendererRegistryEntry, JsonSchema, ValidationMode} from "@jsonforms/core";
import {createI18nTranslate, getFormbuilder, type ToolInterface} from "@/";
import {formBuilderCatalogue} from "@/translations/de";

const props = defineProps<{
  jsonforms: { schema:JsonSchema, uischema:any },
  data?: any,
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
const errorAfterUpdated = ref<any[]>([]);

const jf = JSON.parse(JSON.stringify({
    schema: props.jsonforms.schema,
    uischema: props.jsonforms.uischema,
  }));
// const jf = computed(() => {
//   console.log("FJSubmit.computed jf",{jf:props.jsonforms});
//   //:MAGIC ERROR reparse to avoid proxy objects (maybe it can be removed)
//   return JSON.parse(JSON.stringify({
//     schema: props.jsonforms.schema,
//     uischema: props.jsonforms.uischema,
//   }));
// })

const onChange = (event:any) => {
   latestEvent.value = event;

  errorAfterUpdated.value = [];
  if(event.errors.length) {
    errorAfterUpdated.value = event.errors;
  }
  else {
    emits('changed', latestEvent.value.data)
  }
}

const submit = async () => {
    errors.value = [];
    data.value = latestEvent.value.data;  //its necessary bc changinge validationMode clears form
    validationMode.value = 'ValidateAndShow';
    if (latestEvent.value.errors.length) {
        errors.value = latestEvent.value.errors.map((error:any) => error?.message)
        return;
    }

    emits('submit', data.value)
}

// watch(()=>props.data,(d)=>{
//   data.value = props.data;
// },{deep:true})

//defineExpose({submit})

</script>

