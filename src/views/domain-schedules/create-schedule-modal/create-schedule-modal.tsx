'use client';

import React, { useEffect } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Banner, HIERARCHY, KIND as BANNER_KIND } from 'baseui/banner';
import { Modal, ModalButton } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { useForm } from 'react-hook-form';
import { MdCheckCircle, MdErrorOutline } from 'react-icons/md';

import useCreateSchedule from '@/views/shared/hooks/use-create-schedule/use-create-schedule';

import CreateScheduleForm from './create-schedule-form/create-schedule-form';
import { type CreateScheduleFormData } from './create-schedule-form/create-schedule-form.types';
import transformCreateScheduleFormDataToRequestBody from './helpers/transform-create-schedule-form-data-to-request-body';
import { overrides, styled } from './create-schedule-modal.styles';
import { type Props } from './create-schedule-modal.types';
import { createScheduleFormSchema } from './schemas/create-schedule-form-schema';

export default function CreateScheduleModal({
  domain,
  cluster,
  isOpen,
  onClose,
}: Props) {
  const { enqueue } = useSnackbar();

  const { mutate, isPending, error, reset: resetMutation } = useCreateSchedule({
    domain,
    cluster,
  });

  const { control, handleSubmit, reset, clearErrors, trigger } =
    useForm<CreateScheduleFormData>({
      resolver: zodResolver(createScheduleFormSchema),
      defaultValues: {
        cronExpression: {
          minutes: '*',
          hours: '*',
          daysOfMonth: '*',
          months: '*',
          daysOfWeek: '*',
        },
      },
      mode: 'onSubmit',
      reValidateMode: 'onChange',
    });

  useEffect(() => {
    if (!isOpen) return;
    reset();
    clearErrors();
    resetMutation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const onSubmit = (data: CreateScheduleFormData) => {
    clearErrors();
    const requestBody = transformCreateScheduleFormDataToRequestBody(data);
    mutate(requestBody, {
      onSuccess: () => {
        enqueue({
          message: 'Schedule created',
          startEnhancer: MdCheckCircle,
          actionMessage: 'OK',
        });
        onClose();
      },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      closeable
      overrides={overrides.modal}
    >
      <styled.ModalHeader>Create Schedule</styled.ModalHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <styled.ModalBody>
          <CreateScheduleForm control={control} trigger={trigger} />
          {error && !error.validationErrors?.length && (
            <Banner
              hierarchy={HIERARCHY.low}
              kind={BANNER_KIND.negative}
              overrides={overrides.banner}
              artwork={{ icon: MdErrorOutline }}
            >
              {error.message}
            </Banner>
          )}
        </styled.ModalBody>
        <styled.ModalFooter>
          <ModalButton
            size="compact"
            type="button"
            kind="secondary"
            onClick={onClose}
          >
            Cancel
          </ModalButton>
          <ModalButton
            size="compact"
            kind="primary"
            type="submit"
            isLoading={isPending}
          >
            Create schedule
          </ModalButton>
        </styled.ModalFooter>
      </form>
    </Modal>
  );
}
