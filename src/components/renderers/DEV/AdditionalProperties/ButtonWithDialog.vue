<template>

  <button
      @click="addPropertyDialog"
      v-text="'[+]'"
  />

</template>



<script setup lang="ts">
import type {Ref} from "vue";
import {inject, watch} from "vue";
import {useJsonFormsControlWithDetail} from "@jsonforms/vue";
import type {AdditionalPropertyType} from "./utils/additionalProperties";
import {createAdditionalProperty, isAdditionalPropertyExists, setNewData, createAdvancedDefaultValue} from "./utils/additionalProperties";

const props = defineProps<{
  input: ReturnType<typeof useJsonFormsControlWithDetail>
}>();

const control = props.input.control;

const additionalPropertyItems = inject<Ref<AdditionalPropertyType[]>|undefined>("additionalPropertyItems", undefined) ?? (() => {throw "injection 'additionalPropertyItems' not found"})()


const addPropertyDialog = () => {
  const name = prompt("Name of the Property");
  if(name) {
    addProperty(name);
  }
}

const addProperty = (newPropertyName:string) => {
  const additionalProperty = createAdditionalProperty(newPropertyName, undefined, control.value.schema, control.value.path);

  //FIX - create empty object if data is undefined
  if (undefined === control.value?.data && additionalProperty.schema) {
    control.value.data = {};
  }

  //FIX - add duplicate check
  if (isAdditionalPropertyExists(additionalProperty, control.value.schema, control.value?.data)) {
    return;
  }


  additionalPropertyItems.value.push(additionalProperty)

  if ('object' === typeof control.value?.data && additionalProperty.schema) {
    control.value.data[newPropertyName] = createAdvancedDefaultValue(additionalProperty.schema);
    props.input.handleChange(control.value.path, control.value.data);    // we need always to preserve the key even when the value is "empty"
  }
}


watch(() => control.value.data, (newData) => {

  // revert back any undefined values back to the default value when the key is part of the addtional properties since we want to preserved the key
  // for example when we have a string additonal property then when we clear the text component the componet by default sets the value to undefined to remove the property from the object - for additional properties we do not want that behaviour

  const hasChanges = 'object' === typeof newData && setNewData(newData, additionalPropertyItems.value)
  if (hasChanges) {
    props.input.handleChange(control.value.path, newData);
  }

}, {deep: true})

</script>
