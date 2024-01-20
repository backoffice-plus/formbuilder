<template>

    <section :class="styles.objectAddProps.items">
      <div
          v-for="(element, index) in additionalPropertyItems"
          :key="`${index}`"
      >
        <DispatchRenderer
            v-if="element.schema && element.uischema"
            :schema="element.schema"
            :uischema="element.uischema"
            :path="element.path"
            :enabled="control.enabled"
            :renderers="control.renderers"
            :cells="control.cells"
        />

        <!--  :disabled="removePropertyDisabled" -->
        <button
            v-if="control.enabled"
            @click="removeProperty(element.propertyName)"
            v-text="'x'"
        />
      </div>
    </section>

</template>


<script setup lang="ts">
import {inject, onBeforeMount, provide, ref, Ref} from "vue";
import {DispatchRenderer, useJsonFormsControlWithDetail} from "@jsonforms/vue";
import {AdditionalPropertyType, createAdditionProperties} from "./utils/additionalProperties";
import {type BopStyles, defaultStyles, useStyles} from "../composition";

const props = defineProps<{
  input: ReturnType<typeof useJsonFormsControlWithDetail>
}>();

const control = props.input.control;

const styles = useStyles(control.value.uischema, defaultStyles) as BopStyles;

const additionalPropertyItems = inject<Ref<AdditionalPropertyType[]> | undefined>("additionalPropertyItems", undefined) ?? (() => {throw "injection 'additionalPropertyItems' not found"})()

const removeProperty = (propName: string) => {
  additionalPropertyItems.value = additionalPropertyItems.value.filter((d: any) => d.propertyName !== propName);

  if ('object' === typeof control.value?.data) {
    delete control.value.data[propName];
    props.input.handleChange(control.value.path, control.value.data);
  }
};

onBeforeMount(() => {
  additionalPropertyItems.value = createAdditionProperties(control.value.schema, control.value?.data, control.value.path)
})

</script>.value
