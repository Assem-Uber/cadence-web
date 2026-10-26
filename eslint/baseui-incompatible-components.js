module.exports = {
  paths: [
    {
      name: 'react-input-mask',
      message:
        'Do not import react-input-mask because it is incompatible with React 19.',
    },
    {
      name: 'baseui/datepicker',
      importNames: [
        'DatePicker',
        'Datepicker',
        'StatefulDatePicker',
        'Datepicker_DO_NOT_USE',
      ],
      message:
        'Do not import this DatePicker because it is incompatible with React 19. Use @/components/date-time-picker or StatefulCalendar, Calendar, TimePicker, or TimezonePicker. DatepickerOverrides is still allowed for Calendar styling.',
    },
    {
      name: 'baseui/input',
      importNames: ['MaskedInput'],
      message:
        'Do not import MaskedInput because it is incompatible with React 19. Use baseui Input instead.',
    },
  ],
  patterns: [
    {
      group: ['baseui/datepicker/*', 'baseui/datepicker/**'],
      message:
        'Do not deep-import baseui/datepicker because it is incompatible with React 19. Use DateTimePicker or allowed calendar and time exports from baseui/datepicker.',
    },
    {
      group: [
        'baseui/input/masked-input',
        'baseui/input/masked-input/*',
        '**/react-input-mask',
        '**/react-input-mask/*',
      ],
      message:
        'Do not import masked input or react-input-mask as they are incompatible with React 19.',
    },
  ],
};
