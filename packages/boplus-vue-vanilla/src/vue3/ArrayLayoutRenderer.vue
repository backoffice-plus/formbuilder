<template>
  <div v-if="control.visible" :class="styles.arrayList.root">

    <label :class="styles.arrayList.label">
      {{ computedLabel }}
    </label>


      <div :class="styles.arrayList.itemToolbar">

        <select v-model="currentlyExpanded">
          <option
              v-for="(_element, index) in control.data"
              :key="`${control.path}-${index}`"
              :class="styles.arrayList.item"
              v-text="'' + (index+1) +'. '+ childLabelForIndex(index) + (errorsPerChild[index] ? ' ('+ errorsPerChild[index].length +' Errors)' : '')"
              :value="index"
          />
        </select>

        <button
            :class="styles.arrayList.addButton"
            :disabled="
                  !control.enabled ||
                  (appliedOptions.restrict && arraySchema.maxItems !== undefined && dataLength >= arraySchema.maxItems)
                "
            @click="addButtonClick"
        >
          +
        </button>

      </div>

      <div v-if="dataLength > 0" :class="styles.arrayList.itemContent">

        <fieldset class="group">
          <legend class="group-label">{{  childLabelForIndex(currentlyExpanded)  }}</legend>

          <dispatch-renderer
              :schema="control.schema"
              :uischema="foundUISchema"
              :path="composePaths(control.path, `${currentlyExpanded}`)"
              :enabled="control.enabled"
              :renderers="control.renderers"
              :cells="control.cells"
          />

          <footer>
            <button
                :class="styles.arrayList.itemDelete"
                :disabled="!control.enabled || (appliedOptions.restrict && arraySchema.minItems !== undefined && dataLength <= arraySchema.minItems)"
                @click="onDelete(currentlyExpanded)"
                v-if="dataLength > 0"
            />
          </footer>

        </fieldset>
      </div>

      <div v-if="dataLength === 0" :class="styles.arrayList.noData">
        No data
      </div>




      <div :class="styles.control.error" v-if="control.childErrors.length > 0">
        <span v-text="control.childErrors.length +' Errors'" />
      </div>

  </div>
</template>

<script lang="ts">
import {
  rankWith,
  isObjectArrayWithNesting,
  composePaths,
  createDefaultValue,
  findUISchema,
  Resolve,
  getControlPath,
  getI18nKey,
} from '@jsonforms/core';
import type {
  JsonFormsRendererRegistryEntry,
  ControlElement,
  UISchemaElement,
  JsonSchema,
} from '@jsonforms/core';

import { defineComponent, ref } from 'vue';
import {
  DispatchRenderer,
  rendererProps,
  useJsonFormsArrayControl,
} from '@jsonforms/vue';
import type {
  RendererProps,
} from '@jsonforms/vue';
import {
  useBoPlusArrayControl,
  useNested,
  // useTranslator,
  i18nDefaultMessages,
} from './utils';
//import { ValidationIcon, ValidationBadge } from '../controls/components/index';
import type { ErrorObject } from 'ajv';
import merge from 'lodash/merge';
import {ControlWrapper, useVanillaArrayControl, useVanillaControl} from "@jsonforms/vue-vanilla";


/**
 * https://github.com/eclipsesource/jsonforms-vuetify-renderers/blob/main/vue2-vuetify/src/layouts/ArrayLayoutRenderer.vue
 */


type I18nArrayLayoutKey = keyof typeof i18nDefaultMessages.arraylayout;
const controlRenderer = defineComponent({
  name: 'array-layout-renderer',
  components: {
    ControlWrapper,
    DispatchRenderer,
    // ValidationIcon,
    // ValidationBadge,
  },
  props: {
    ...rendererProps<ControlElement>(),
  },
  setup(props: RendererProps<ControlElement>) {
    const control = useBoPlusArrayControl(useVanillaArrayControl(useJsonFormsArrayControl(props)));
    const currentlyExpanded = ref<null | number>(
        control.appliedOptions.value.initCollapsed ? null : 0
    );
    // const expansionPanelsProps = computed(() =>
    //     merge(
    //         { flat: false, focusable: true },
    //         control.vuetifyProps('v-expansion-panels')
    //     )
    // );
    const suggestToDelete = ref<null | number>(null);
    // indicate to our child renderers that we are increasing the "nested" level
    useNested('array');
    //const t = useTranslator();
    return {
      ...control,
      currentlyExpanded,
      //expansionPanelsProps,
      suggestToDelete,
      //t,
    };
  },
  computed: {
    addDisabled(): boolean {
      return (
          !this.control.enabled ||
          (this.appliedOptions.restrict &&
              this.arraySchema !== undefined &&
              this.arraySchema.maxItems !== undefined &&
              this.dataLength >= this.arraySchema.maxItems)
      );
    },
    dataLength(): number {
      return this.control.data ? this.control.data.length : 0;
    },
    foundUISchema(): UISchemaElement {
      return findUISchema(
          this.control.uischemas,
          this.control.schema,
          this.control.uischema.scope,
          this.control.path,
          undefined,
          this.control.uischema,
          this.control.rootSchema
      );
    },
    arraySchema(): JsonSchema | undefined {
      return Resolve.schema(
          this.control.rootSchema,
          this.control.uischema.scope,
          this.control.rootSchema
      );
    },
    hideAvatar(): boolean {
      return !!this.appliedOptions.hideAvatar;
    },
    translatedLabels(): { [key in I18nArrayLayoutKey]: string } {
      const elementToDeleteText = this.childLabelForIndex(this.suggestToDelete);
      return {
        add: this.translateLabel('add'),
        delete: this.translateLabel('delete'),
        moveUp: this.translateLabel('moveUp'),
        moveDown: this.translateLabel('moveDown'),
        dialogTitle: this.translateLabel(
            'dialogTitle',
            {
              element: elementToDeleteText,
            },
            (message) =>
                message.replace(
                    /\{\{\s?element\s?\}\}/,
                    elementToDeleteText || 'element'
                )
        ),
        dialogText: this.translateLabel('dialogText'),
        dialogCancel: this.translateLabel('dialogCancel'),
        dialogConfirm: this.translateLabel('dialogConfirm'),
      };
    },

    //
    errorsPerChild() {
      const r = {} as Record<string, Array<any>>;
      this.control.childErrors.forEach((error:any) => {
        const found = error.instancePath.match('\/'+this.control.path+'\/(\\d+)')
        if(found && found[1]) {
          if(!r[found[1]]) {
            r[found[1]] = [];
          }
          r[found[1]].push(error);
        }
      });

      return r;
    }
  },
  methods: {
    composePaths,
    createDefaultValue,
    addButtonClick() {
      this.addItem(
          this.control.path,
          createDefaultValue(this.control.schema)
      )();
      if (!this.appliedOptions.collapseNewItems && this.control.data?.length) {
        this.currentlyExpanded = this.dataLength - 1;
      }
    },
    moveUpClick(event: Event, toMove: number): void {
      event.stopPropagation();
      this.moveUp?.(this.control.path, toMove)();
    },
    moveDownClick(event: Event, toMove: number): void {
      event.stopPropagation();
      this.moveDown?.(this.control.path, toMove)();
    },
    removeItemsClick(toDelete: number[] | null): void {
      if (toDelete !== null) {
        this.removeItems?.(this.control.path, toDelete)();
      }
    },
    childErrors(index: number): ErrorObject[] {
      return this.control.childErrors.filter((e) => {
        const errorDataPath = getControlPath(e);
        return errorDataPath.startsWith(
            this.composePaths(this.control.path, `${index}`)
        );
      });
    },
    translateLabel(
        labelType: I18nArrayLayoutKey,
        additionalContext: Record<string, unknown> | undefined = undefined,
        transformMessage: (message: string) => string = (text) => text
    ): string {
      const i18nKey = getI18nKey(
          this.arraySchema,
          this.control.uischema,
          this.control.path,
          labelType
      );
      const context = {
        schema: this.control.schema,
        uischema: this.control.uischema,
        path: this.control.path,
        data: this.control.data,
        ...additionalContext,
      };
      //:TODO add translation
      return i18nDefaultMessages.arraylayout[labelType];
      //const translation = this.t(i18nKey, undefined, context);
      // if (translation !== undefined) {
      //   return translation;
      // }
      // return this.t(
      //     `arraylayout.${labelType}`,
      //     transformMessage(i18nDefaultMessages.arraylayout[labelType]),
      //     context
      // );
    },

    //
    onDelete(index: number) {
      Promise.resolve(window.confirm('Delete Element: ' + this.childLabelForIndex(index)))
          .then((confirmed: boolean) => {
            if (confirmed) {
              this.removeItems(this.control.path, [index])();
            }
          });
    }
  },
});
export default controlRenderer;
export const entry: JsonFormsRendererRegistryEntry = {
  renderer: controlRenderer,
  tester: rankWith(4, isObjectArrayWithNesting),
};
</script>

<style scoped>
.notranslate {
  transform: none !important;
}
/deep/ .v-toolbar__content {
  padding-left: 0;
}
</style>
