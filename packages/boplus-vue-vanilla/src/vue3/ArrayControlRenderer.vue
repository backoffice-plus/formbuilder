<template>
  <div v-if="control.visible" :class="styles.arrayList.root">

    <div :class="styles.arrayList.itemToolbar">

<!--      <validation-icon-->
<!--          v-if="control.childErrors.length > 0"-->
<!--          :errors="control.childErrors"-->
<!--      />-->

      <label class="flex-grow label" :class="styles.arrayList.label">{{ computedLabel }}</label>

      <button
          :class="styles.arrayList.addButton"
          :disabled="
                  !control.enabled ||
                  (appliedOptions.restrict && arraySchema.maxItems !== undefined && dataLength >= arraySchema.maxItems)
                "
          @click="addButtonClick"
      >
        +
<!--        {{ `Add to ${control.label}` }}-->
      </button>
    </div>

    <table :class="{withSortButtons:appliedOptions.showSortButtons}">
      <thead v-if="control.schema.type === 'object'">
      <tr>
        <th
            v-for="(prop, index) in getValidColumnProps(control.schema)"
            :key="`${control.path}-header-${index}`"
            scope="col"
        >
          {{ title(prop) }}
        </th>
        <th
            v-if="control.enabled"
            scope="col"
        />
      </tr>
      </thead>

      <tbody>
      <tr
          v-for="(element, index) in control.data"
          :key="`${control.path}-${index}`"
          :class="styles.arrayList.item"
      >
        <td
            v-for="propName in getValidColumnProps(control.schema)"
            :key="composePaths(composePaths(control.path, `${index}`), propName)"
        >
          <dispatch-renderer
              :schema="control.schema"
              :uischema="resolveUiSchema(propName)"
              :path="composePaths(control.path, `${index}`)"
              :enabled="control.enabled"
              :renderers="control.renderers"
              :cells="control.cells"
          />
        </td>

        <td v-if="control.enabled">
          <button
              :class="styles.arrayList.itemMoveUp"
              :disabled="index <= 0 || !control.enabled"
              @click="moveUpClick($event, index)"
              v-text="'up'"
              v-if="appliedOptions.showSortButtons"
          />
          <button
              :class="styles.arrayList.itemMoveUp"
              :disabled="index >= dataLength - 1 || !control.enabled"
              @click="moveDownClick($event, index)"
              v-text="'down'"
              v-if="appliedOptions.showSortButtons"
          />
          <button
              :class="styles.arrayList.itemDelete"
              :disabled="!control.enabled || (appliedOptions.restrict &&  arraySchema.minItems !== undefined && dataLength <= arraySchema.minItems)                    "
              @click="removeItemsClick($event, [index])"
          />
        </td>

      </tr>
      </tbody>

    </table>

    <div v-if="!dataLength" :class="styles.arrayList.noData">
      No data
    </div>

    <div :class="styles.control.error"
         v-if="control.childErrors.length > 0">
        <span
            v-text="control.childErrors.length +' Errors'"
        />
    </div>



  </div>
</template>

<script lang="ts">
import {
  isObjectArrayControl,
  isPrimitiveArrayControl,
  or,
  rankWith,
  composePaths,
  createDefaultValue,
  Resolve,
} from '@jsonforms/core';

import type {
  JsonFormsRendererRegistryEntry,
  ControlElement,
  JsonSchema,
} from '@jsonforms/core';
import startCase from 'lodash/startCase';
import { defineComponent } from 'vue';
import {
  DispatchCell,
  DispatchRenderer,
  rendererProps,
  useJsonFormsArrayControl,
} from '@jsonforms/vue';

import type {
  RendererProps,
} from '@jsonforms/vue';

import { useBoPlusArrayControl } from './utils';


/**
 * @see https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/complex/ArrayControlRenderer.vue
 */

//import { ValidationIcon, ValidationBadge } from '../controls/components/index';
const controlRenderer = defineComponent({
  name: 'array-control-renderer',
  components: {
    DispatchCell,
    DispatchRenderer,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    return useBoPlusArrayControl(useJsonFormsArrayControl(props));
  },
  computed: {
    arraySchema(): JsonSchema | undefined {
      return Resolve.schema(
          this.control.rootSchema,
          this.control.uischema.scope,
          this.control.rootSchema
      );
    },
    dataLength(): number {
      return this.control.data ? this.control.data.length : 0;
    },
  },
  methods: {
    composePaths,
    createDefaultValue,
    addButtonClick() {
      this.addItem(
          this.control.path,
          createDefaultValue(this.control.schema)
      )();
    },
    moveUpClick(event: Event, toMove: number): void {
      event.stopPropagation();
      this.moveUp?.(this.control.path, toMove)();
    },
    moveDownClick(event: Event, toMove: number): void {
      event.stopPropagation();
      this.moveDown?.(this.control.path, toMove)();
    },
    removeItemsClick(event: Event, toDelete: number[]): void {
      event.stopPropagation();
      this.removeItems?.(this.control.path, toDelete)();
    },
    getValidColumnProps(scopedSchema: JsonSchema) {
      if (
          scopedSchema.type === 'object' &&
          typeof scopedSchema.properties === 'object'
      ) {
        return Object.keys(scopedSchema.properties).filter(
            (prop) => scopedSchema.properties![prop].type !== 'array'
        );
      }
      // primitives
      return [''];
    },
    title(prop: string) {
      return this.control.schema.properties?.[prop]?.title ?? startCase(prop);
    },
    resolveUiSchema(propName: string) {
      return this.control.schema.properties
          ? this.controlWithoutLabel(`#/properties/${propName}`)
          : this.controlWithoutLabel('#');
    },
    controlWithoutLabel(scope: string): ControlElement {
      return { type: 'Control', scope: scope, label: false };
    },
  },
});
export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(3, or(isObjectArrayControl, isPrimitiveArrayControl)),
};
</script>

<style scoped>
.fixed-cell {
  width: 150px;
  height: 50px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  text-align: center;
}
.fixed-cell-small {
  width: 50px;
  height: 50px;
  padding-left: 0 !important;
  padding-right: 0 !important;
  text-align: center;
}
.array-container tbody tr td {
  border-bottom: none !important;
}
.array-container tbody tr td .container {
  padding: 0;
  margin: 0;
}
</style>
