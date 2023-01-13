<template>

    <section class="p-4 ">

      <h2>Optionen</h2>

      <!--
      :TODO how to change class from jsonForms?
      -->
      <JsonForms
          :class="'styleA'"
          :schema="jsonFormSchema.schema"
          :uischema="jsonFormSchema.uischema"
          :data="options"
          :renderers="jsonFormRenderes"
          :ajv="ajv"
          :i18n="{translate: createI18nTranslate(formBuilderCatalogue)}"
          @change="onChange"
      />

<!--      <div class="mt-4 flex justify-center">-->
<!--        <button class="button blue">Submit</button>-->
<!--      </div>-->

    </section>

</template>



<style scoped>

</style>



<script setup>

import {JsonForms} from "@jsonforms/vue";
import {
  jsonFormRenderes,
  createI18nTranslate,
  normalizeModalOptions, emitter
} from "../index";
import {jsonForms as jsonFormsOption} from "../schema/formBuilderControlOptions";
import {jsonForms as jsonFormsLabel} from "../schema/formBuilderOptionsLabel";
import {jsonForms as jsonFormsLabelElement} from "../schema/toolOptionsLabel";
import {computed, onMounted, ref} from "vue";
import {createAjv} from "@jsonforms/core";
import {formBuilderCatalogue} from "../translations/de";

const props = defineProps(['tool', 'data']);
const emit = defineEmits(['change']);

const ajv = createAjv();//is needed because reactive :schema & :uischema will throw error

const options = ref({});
const jsonFormSchema = ref({});

onMounted(() => {
  options.value = normalizeModalOptions(props.tool);
  jsonFormSchema.value = getJsonForms();
})

const getJsonForms = () => {
  switch (props.tool.props.jsonForms.uischema.type) {
    case 'Control':
      return jsonFormsOption

    case 'Label':
      return jsonFormsLabelElement

      //:TODO: add also Rules
      // case 'Group':
      // case 'Category':
      //   return jsonFormsLabel

      //:TODO only rules (maybe load formControlSchema and clear unused tabs
      //case 'Categorization':
      //  return [formLayoutGroupSchema, formLayoutGroupUiSchema]

    default:
      return jsonFormsLabel
  }
};

const onChange = (e) => {

  if(e.errors.length) {
    console.warn("OptionModal", "errors at onChange", e.errors, e.data);
  }
  else {
    //const data = {...e.data};//:TODO deep copy
    const data = JSON.parse(JSON.stringify(e.data));

    emit('change', data);
    emitter.emit('formBuilderUpdated');
  }
}

</script>
