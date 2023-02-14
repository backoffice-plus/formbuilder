<template>

  <!--  :class="styles.oneOf.root" -->
  <div class="oneOf" v-if="control.visible">

    <CompinatorProperties
        :schema="control.schema"
        combinatorKeyword="oneOf"
        :path="control.path"
    />

    <ControlWrapper
        v-bind="input.controlWrapper.value"
        :styles="input.styles"
        :isFocused="!!input.isFocused"
        :appliedOptions="input.appliedOptions"
    >
      <select
          :id="control.id + '-input'"
          :class="input.styles.control.input"
          :disabled="!control.enabled"
          :autofocus="input.appliedOptions.focus"
          :required="control.required"
          v-model="selectIndex"
      >
        <option
            v-for="(item, index) in indexedOneOfRenderInfos"
            v-text="item.label"
            :value="index"
        />
      </select>

      <dispatch-renderer
          v-if="indexedOneOfRenderInfos && indexedOneOfRenderInfos[confirmedIndex]"
          :schema="indexedOneOfRenderInfos[confirmedIndex].schema"
          :uischema="indexedOneOfRenderInfos[confirmedIndex].uischema"
          :path="control.path"
          :renderers="control.renderers"
          :cells="control.cells"
          :enabled="control.enabled"
      />
    </ControlWrapper>

  </div>

</template>


<script setup lang="ts">
import {computed, ref, watch,} from 'vue';
import type {ControlElement} from '@jsonforms/core';
import {createAjv, createCombinatorRenderInfos, createDefaultValue} from '@jsonforms/core';
import {DispatchRenderer, rendererProps, useJsonFormsOneOfControl} from '@jsonforms/vue';
import {ControlWrapper, useVanillaControl} from "@jsonforms/vue-vanilla";
import CompinatorProperties from "./CompinatorProperties.vue";


/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/OneOfRenderer.vue
 */

const props = defineProps(rendererProps<ControlElement>());

const input = useVanillaControl(useJsonFormsOneOfControl(props)) as any
const control = input.control.value as any;

const confirmedIndex = ref(input.control.value.indexOfFittingSchema);
const selectIndex = ref(confirmedIndex.value);

const ajv = createAjv();

const indexedOneOfRenderInfos = computed(() => {
  return createCombinatorRenderInfos(
      input.control.value.schema.oneOf!,
      input.control.value.rootSchema,
      'oneOf',
      input.control.value.uischema,
      input.control.value.path,
      input.control.value.uischemas
  )
})

watch(selectIndex, (newIndex, oldIndex) => {
  if (input.control.value.enabled && confirmedIndex.value !== newIndex) {
    let confirmAlert = true;

    //:TODO read the current data (they are not in this.control.data!!!)
    const hasData = false;//!isEmpty(this.control.data);
    if (hasData) {
      confirmAlert = confirm("Your data will be cleared if you select this new option. Do you want to proceed?");
    }

    if (confirmAlert) {
      confirmedIndex.value = newIndex;
    } else {
      selectIndex.value = oldIndex;
    }
  }
});

watch(confirmedIndex, (newIndex, oldIndex) => {
  /** @ts-ignore */
  const schema = indexedOneOfRenderInfos.value[newIndex]?.schema;
  input.handleChange(input.control.value.path, (schema && createDefaultValue(schema)) ?? {})
});


</script>
