'use client';

import React, { type ReactNode } from 'react';

import { FormControl } from 'baseui/form-control';

import { overrides, styled } from './domain-schedules-horizontal-field.styles';
import {
  type Component,
  type GroupedFieldsProps,
  type Props,
} from './domain-schedules-horizontal-field.types';

const DomainSchedulesHorizontalField: Component = function DomainSchedulesHorizontalField({
  label,
  description,
  htmlFor,
  error,
  children,
}: Props) {
  return (
    <styled.FieldRow>
      <styled.FieldLabelColumn>
        {htmlFor ? (
          <styled.FieldLabel htmlFor={htmlFor}>{label}</styled.FieldLabel>
        ) : (
          <styled.FieldLabelText>{label}</styled.FieldLabelText>
        )}
        {description ? (
          <styled.FieldDescription>{description}</styled.FieldDescription>
        ) : null}
      </styled.FieldLabelColumn>
      <styled.FieldControlColumn>
        <FormControl
          error={error}
          overrides={overrides.horizontalFieldFormControl}
        >
          {children}
        </FormControl>
      </styled.FieldControlColumn>
    </styled.FieldRow>
  );
};

function GroupedFields({ children }: GroupedFieldsProps) {
  return <styled.GroupedFields>{children}</styled.GroupedFields>;
}

DomainSchedulesHorizontalField.GroupedFields = GroupedFields;

export default DomainSchedulesHorizontalField;
