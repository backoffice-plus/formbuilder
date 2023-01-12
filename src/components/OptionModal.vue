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
  buildModalOptions, denormalizeModalOptions, emitter
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

const jsonFormSchema = computed(() => {
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
});

const options = ref(buildModalOptions(props.tool));

const onChange = (e) => {

  if(e.errors.length) {
    console.warn("modal onChange has errors", e.errors);
  }
  else {
    const data = {...e.data};//:TODO deep copy

    emit('change', data);
    emitter.emit('formBuilderUpdated');
  }
}

</script>
