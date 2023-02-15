<template>

  <div :class="input.styles.arrayList.root">

    <!--
    input: [ "control", "addItem", "removeItems", "moveUp", "moveDown", "styles", "appliedOptions", "childUiSchema", "childLabelForIndex", "isFocused", "controlWrapper", "onChange" ]
    control: [ "uischema", "path", "schema", "enabled", "renderers", "cells", "config", "data", "description", "errors", "label", "visible", "id", "required", "rootSchema", "uischemas", "childErrors" ]
    styles.arrayList: [ "root", "legend", "addButton", "label", "itemWrapper", "noData", "item", "itemToolbar", "itemLabel", "itemContent", "itemExpanded", "itemMoveUp", "itemMoveDown", "itemDelete" ]
    -->

    <control-wrapper
        v-bind="input.controlWrapper.value"
        :styles="input.styles"
        :isFocused="!!input.isFocused"
        :appliedOptions="input.appliedOptions"
    >

      <div :class="input.styles.arrayList.toolbar">
        <span
            v-text="control.childErrors.length +' Errors'"
            v-if="control.childErrors.length > 0"
        />

        <select v-model="currentlyExpanded">
          <option
              v-for="(_element, index) in control.data"
              :key="`${control.path}-${index}`"
              :class="input.styles.arrayList.item"
              v-text="'' + (index+1) +'. '+ input.childLabelForIndex(index)"
              :value="index"
          />
        </select>

        <button
            :class="input.styles.arrayList.addButton"
            :disabled="
                  !control.enabled ||
                  (input.appliedOptions.restrict && arraySchema?.maxItems !== undefined && dataLength >= arraySchema.maxItems)
                "
            @click="addButtonClick"
            :aria-label="`Add to ${control.label}`"
        >
          Add
        </button>
      </div>


      <div :class="input.styles.arrayList.itemToolbar">
        <button
            :class="input.styles.arrayList.itemDelete"
            :disabled="!control.enabled || (input.appliedOptions.restrict && arraySchema?.minItems !== undefined && dataLength <= arraySchema.minItems)"
            @click="onDelete(currentlyExpanded)"
            v-if="dataLength > 0"
        >
          Delete
        </button>
      </div>

      <div v-if="dataLength > 0" :class="input.styles.arrayList.itemContent">
        <dispatch-renderer
            :schema="control.schema"
            :uischema="foundUISchema"
            :path="composePaths(control.path, `${currentlyExpanded}`)"
            :enabled="control.enabled"
            :renderers="control.renderers"
            :cells="control.cells"
        />
      </div>

      <div v-if="dataLength === 0" :class="input.styles.arrayList.noData">
        No data
      </div>

    </control-wrapper>
  </div>

</template>


<script setup lang="ts">
import type {ControlElement, JsonSchema, UISchemaElement} from '@jsonforms/core';
import {composePaths, createDefaultValue, findUISchema, Resolve} from '@jsonforms/core';
import {DispatchRenderer, rendererProps, useJsonFormsArrayControl} from '@jsonforms/vue';
import {ControlWrapper, useVanillaArrayControl, useVanillaControl} from "@jsonforms/vue-vanilla";
import {computed, ref} from "vue";

/**
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/layouts/ArrayLayoutRenderer.vue
 */

const props = defineProps(rendererProps<ControlElement>());

const input = useVanillaControl(useVanillaArrayControl(useJsonFormsArrayControl(props) as any) as any) as any
const control = input.control;

const currentlyExpanded = ref<null | number>(input.appliedOptions.value.initCollapsed ? null : 0);

const dataLength = computed((): number => input.control.value.data?.length ?? 0);

const arraySchema = computed((): JsonSchema | undefined => {
  return Resolve.schema(
      input.control.value.rootSchema,
      input.control.value.uischema.scope,
      input.control.value.rootSchema
  );
});

const foundUISchema = computed((): UISchemaElement => {
  return findUISchema(
      input.control.value.uischemas,
      input.control.value.schema,
      input.control.value.uischema.scope,
      input.control.value.path,
      undefined,
      input.control.value.uischema,
      input.control.value.rootSchema
  );
});

const addButtonClick = () => {
  input.addItem(input.control.value.path, createDefaultValue(input.control.value.schema))();
  if (!input.appliedOptions.collapseNewItems && dataLength) {
    currentlyExpanded.value = dataLength.value - 1;
  }
};

const onDelete = (index: number) => {
  if (confirm('Delete Element: ' + input.childLabelForIndex(index))) {
    input?.removeItems(input.control.value.path, [index])();
  }
}

</script>
