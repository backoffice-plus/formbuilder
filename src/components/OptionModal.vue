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
import {jsonFormRenderes} from "../index";
import {jsonForms as jsonFormsOption} from "../schema/formBuilderControlOptions";
import {jsonForms as jsonFormsLabel} from "../schema/formBuilderOptionsLabel";
import {computed} from "vue";

const props = defineProps(['uuid', 'data', 'type']);
const emit = defineEmits(['change']);
const options = {...props.data ?? {}};
const formType = props.type;


//convert enum to object
if(options?.enum) {
  options.enum = options.enum.map(name => {return {name: String(name)} });
}
if(options?.rule?.condition?.schema) {
  options.rule.condition.schema = JSON.stringify(options.rule.condition.schema);
}

const jsonFormSchema = computed(() => {
  switch (formType) {
    case 'Group':
    case 'Category':
      return jsonFormsLabel

    //:TODO only rules (maybe load formControlSchema and clear unused tabs
    //case 'Categorization':
    //  return [formLayoutGroupSchema, formLayoutGroupUiSchema]

    default:
      return jsonFormsOption;
  }
});

const onChange = (e) => {

  if(e.errors.length) {
    console.warn("modal onChange has errors", e.errors);
  }
  else {
    const data = {...e.data};//:TODO deep copy

    //convert enum to map
    if(data?.enum) {
      data.enum = data.enum?.map(item=>String(item?.name ?? '')) ?? [''];
      data.enum = [...new Set(data.enum)];
    }

    if(typeof data?.rule?.condition?.schema === "string") {
      try {

        //:TODO deep copy
        data.rule = {...data.rule};
        data.rule.condition = {...data.rule.condition};

        data.rule.condition.schema = JSON.parse(data.rule.condition.schema);
      }
      catch(e) {
        console.warn("modal onChange rule has parse errors", e);
        data.rule.condition.schema = {}
      }
    }

    Object.keys(data).map(key => props.data[key] = data[key]);
  }
}

</script>
