import mitt from 'mitt'
type Events = {
    formBuilderModal: any,
    formBuilderUpdated: any,
    //formBuilderSchemaUpdated: any,
};
export const emitter = mitt<Events>();
