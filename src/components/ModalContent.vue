<template>

    <section class="p-4 ">

      <h2>Optionen</h2>

      <!--
      :TODO how to change class from jsonForms?
      -->
<!--      options: {{ options }}-->
      <JsonForms
          :class="'styleA'"
          :schema="jsonFormSchema?.schema"
          :uischema="jsonFormSchema?.uischema"
          :data="options"
          :renderers="mergedJsonFormRenderes"
          :ajv="ajv"
          :i18n="{translate: createI18nTranslate(formBuilderCatalogue)}"
          @change="onChange"
          v-if="jsonFormSchema?.schema"
      />

<!--      Data: {{ dataAfterUpdated }}-->

<!--      <div class="mt-4 flex justify-center">-->
<!--        <button class="button blue">Submit</button>-->
<!--      </div>-->

    </section>

</template>



<style scoped>

</style>



<script setup>

import {JsonForms} from "@jsonforms/vue";
import {jsonFormRenderes, Tool} from "../index";
import {createI18nTranslate} from "../lib/formbuilder";
import {emitter} from "../lib/mitt";
import {onMounted, ref} from "vue";
import {createAjv} from "@jsonforms/core";
import {formBuilderCatalogue} from "../translations/de";

const props = defineProps({
  tool: Tool,
  data: Object,
  schemaReadOnly: Boolean,
})
const emit = defineEmits(['change']);

const ajv = createAjv();//is needed because reactive :schema & :uischema will throw error

const options = ref({});
const jsonFormSchema = ref({});
const dataAfterUpdated = ref({});
const mergedJsonFormRenderes = ref(jsonFormRenderes);

onMounted(async () => {
  options.value = props.tool.optionDataPrepare(props.tool)
  jsonFormSchema.value = await props.tool.optionJsonforms(props.tool)

  if(props.tool.optionJsonformsRenderer) {
    const renderer = props.tool.optionJsonformsRenderer();
    if(renderer?.length) {
      mergedJsonFormRenderes.value = Object.freeze([
          ...mergedJsonFormRenderes.value,
          ...renderer,
      ])
    }
  }
})

const onChange = (e) => {

  if(e.errors.length) {
    console.warn("ModalOption", "errors at onChange", e.errors, e.data);
  }
  else {
    //const data = {...e.data};//:TODO deep copy
    const data = JSON.parse(JSON.stringify(e.data)); //:TODO other way to remove ref/proxy?
    dataAfterUpdated.value = data;

    props.tool.optionDataUpdate(props.tool, data)

    emit('change', data);
    emitter.emit('formBuilderUpdated');
  }
}

</script>
