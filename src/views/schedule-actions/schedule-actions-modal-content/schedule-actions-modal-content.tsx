import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Banner, HIERARCHY, KIND as BANNER_KIND } from 'baseui/banner';
import { KIND as BUTTON_KIND, SIZE } from 'baseui/button';
import { ModalButton } from 'baseui/modal';
import { useSnackbar } from 'baseui/snackbar';
import { useRouter } from 'next/navigation';
import { type DefaultValues, type FieldValues, useForm } from 'react-hook-form';
import { MdCheckCircle, MdErrorOutline, MdOpenInNew } from 'react-icons/md';

import request from '@/utils/request';
import { type RequestError } from '@/utils/request/request-error';

import { type ScheduleActionInput } from '../schedule-actions.types';

import { overrides, styled } from './schedule-actions-modal-content.styles';
import { type Props } from './schedule-actions-modal-content.types';

export default function ScheduleActionsModalContent<
  Result,
  FormData,
  SubmissionData,
>({
  action,
  params,
  onCloseModal,
  initialFormValues,
}: Props<Result, FormData, SubmissionData>) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { enqueue, dequeue } = useSnackbar();

  type OptionalFormData = FormData extends FieldValues ? FormData : FieldValues;

  const {
    handleSubmit,
    formState: { errors: validationErrors, isSubmitting },
    control,
    watch,
    clearErrors,
    trigger,
  } = useForm<OptionalFormData>({
    resolver: action.modal.formSchema
      ? zodResolver(action.modal.formSchema)
      : undefined,
    defaultValues: initialFormValues as DefaultValues<OptionalFormData>,
  });

  const { mutate, isPending, error } = useMutation<
    Result,
    RequestError,
    ScheduleActionInput<SubmissionData>
  >(
    {
      mutationFn: ({
        domain,
        cluster,
        scheduleId,
        submissionData,
      }: ScheduleActionInput<SubmissionData>) => {
        const httpMethod = action.httpMethod ?? 'POST';

        return request(action.apiRoute({ domain, cluster, scheduleId }), {
          method: httpMethod,
          ...(httpMethod === 'POST'
            ? { body: JSON.stringify(submissionData ?? {}) }
            : {}),
        }).then((res) => res.json() as Result);
      },
      onSuccess: (result, mutationParams) => {
        queryClient.invalidateQueries({
          queryKey: ['describeSchedule', params],
        });

        action.onSuccess?.({ queryClient, params, router });

        onCloseModal();
        enqueue({
          message: action.renderSuccessMessage?.({
            result,
            inputParams: mutationParams,
            onDismissMessage: () => dequeue(),
          }),
          startEnhancer: MdCheckCircle,
          actionMessage: 'OK',
          actionOnClick: () => dequeue(),
        });
      },
    },
    queryClient
  );

  const onSubmit = (data: OptionalFormData) => {
    mutate({
      ...params,
      submissionData: action.modal.withForm
        ? action.modal.transformFormDataToSubmission(data as FormData)
        : (action.getConfirmSubmissionData?.() ??
          (undefined as SubmissionData)),
    });
  };

  const modalText = Array.isArray(action.modal.text) ? (
    action.modal.text.map((text, index) => <p key={index}>{text}</p>)
  ) : (
    <p>{action.modal.text}</p>
  );

  const Form = action.modal.form;
  const isSubmitDisabled = Object.keys(validationErrors).length > 0;
  const modalTitle =
    action.id === 'delete' ? 'Delete schedule' : `${action.label} schedule`;
  const submitLabel =
    action.id === 'delete' ? 'Delete schedule' : `${action.label} schedule`;

  return (
    <>
      <styled.ModalHeader>{modalTitle}</styled.ModalHeader>
      <form onSubmit={handleSubmit(onSubmit)}>
        <styled.ModalBody>
          {modalText}
          {action.modal.docsLink && (
            <styled.Link
              href={action.modal.docsLink.href}
              target="_blank"
              rel="noreferrer"
            >
              {action.modal.docsLink.text}
              <MdOpenInNew />
            </styled.Link>
          )}
          {action.modal.withForm && Form && (
            <Form
              formData={watch()}
              fieldErrors={validationErrors}
              clearErrors={clearErrors}
              control={control}
              trigger={trigger}
              cluster={params.cluster}
              domain={params.domain}
              scheduleId={params.scheduleId}
            />
          )}
          {error && (
            <Banner
              hierarchy={HIERARCHY.low}
              kind={BANNER_KIND.negative}
              overrides={overrides.banner}
              artwork={{
                icon: MdErrorOutline,
              }}
            >
              {error.message}
            </Banner>
          )}
        </styled.ModalBody>
        <styled.ModalFooter>
          <ModalButton
            autoFocus={!action.modal.withForm}
            size={SIZE.compact}
            type="button"
            kind={BUTTON_KIND.secondary}
            onClick={onCloseModal}
          >
            Cancel
          </ModalButton>
          <ModalButton
            size={SIZE.compact}
            kind={BUTTON_KIND.primary}
            type="submit"
            isLoading={isPending || isSubmitting}
            disabled={isSubmitDisabled}
          >
            {submitLabel}
          </ModalButton>
        </styled.ModalFooter>
      </form>
    </>
  );
}
