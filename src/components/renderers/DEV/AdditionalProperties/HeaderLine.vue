<template>

  <header :class="styles.objectAddProps.toolbar">
    <label>{{ additionalPropertiesTitle }}</label>

    <div>

      <!-- :placeholder="placeholder" -->
      <input
          v-model="newPropertyName"
          :required="true"
          type="text"
          :disabled="!control.enabled"
      />

      <!--        <div v-if="newPropertyErrors.length" :class="styles.control.error">-->
      <!--          {{ newPropertyErrors ? newPropertyErrors : null }}-->
      <!--        </div>-->

    </div>

    <div>
      <!-- :disabled="addPropertyDisabled" -->
      <button
          @click="addProperty"
          v-text="'+'"
      />
    </div>
  </header>

</template>


<script setup lang="ts">
import type {Ref} from "vue";
import {computed, inject, ref, watch} from "vue";
import {createDefaultValue} from '@jsonforms/core';
import {useJsonFormsControlWithDetail} from "@jsonforms/vue";
import {AdditionalPropertyType, createAdditionalProperty, isAdditionalPropertyExists, setNewData} from "./utils/additionalProperties";
import {type BopStyles, defaultStyles, useStyles} from "../composition";

const props = defineProps<{
  input: ReturnType<typeof useJsonFormsControlWithDetail>
}>();

const control = props.input.control;

//const t = useTranslator();
//const appliedOptions = useControlAppliedOptions(props.input);
const additionalPropertyItems = inject<Ref<AdditionalPropertyType[] | undefined>>("additionalPropertyItems", undefined);//?? (() => {throw "injection 'additionalPropertyItems' not found"})()

const styles = useStyles(control.value.uischema, defaultStyles) as BopStyles;

const newPropertyName = ref<string | null>('');

const additionalPropertiesTitle = computed((): string | undefined => {
  const label = (control.value.schema?.additionalProperties as any)?.title ?? 'Additional Properties'

  return label;
  //return this.t(this.i18nKey('title'), label);
})

const addProperty = () => {
  if (newPropertyName.value) {
    const additionalProperty = createAdditionalProperty(newPropertyName.value, undefined, control.value.schema, control.value.path);


    //FIX - create empty object if data is undefined
    if (undefined === control.value?.data && additionalProperty.schema) {
      control.value.data = {};
    }
    //FIX - add duplicate check
    if (isAdditionalPropertyExists(additionalProperty, control.value.schema, control.value?.data)) {
      newPropertyName.value = '';
      return;
    }


    additionalPropertyItems.value.push(additionalProperty)

    if ('object' === typeof control.value?.data && additionalProperty.schema) {
      control.value.data[newPropertyName.value] = createDefaultValue(additionalProperty.schema);
      props.input.handleChange(control.value.path, control.value.data);    // we need always to preserve the key even when the value is "empty"
    }
  }

  newPropertyName.value = '';
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
