import { useForm, Controller } from 'react-hook-form';
import { TextField } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import Stack from '@mui/material/Stack';
import { updateProcessingResultReview } from '../../api/actions/processing-results.ts';
import { Review } from '../../../../types/Review.ts';
import { REVIEW_STATUSES } from '../../../../constants/review.ts';
import { useSnackbar } from 'notistack';
import { paths } from '../../../../routes/paths.ts';
import { useNavigate } from 'react-router';
import { useState } from 'react';

interface FormData {
  comment: string;
}

export default function ProcessingReviewForm({
  documentId,
  reviewComment,
}: {
  documentId: string;
  reviewComment?: string;
}) {
  const navigate = useNavigate();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      comment: reviewComment ?? '',
    },
    values: {
      comment: reviewComment ?? '',
    },
    mode: 'onChange',
  });

  const [isApproving, setIsApproving] = useState(false);

  const [isRejecting, setIsRejecting] = useState(false);

  const { enqueueSnackbar } = useSnackbar();

  const updateReview = async (review: Review) => {
    try {
      await updateProcessingResultReview(documentId, review);
      enqueueSnackbar('Review updated successfully', { variant: 'success' });
      navigate(paths.processingResults.root);
    } catch (error: Error | any) {
      enqueueSnackbar(error.message, { variant: 'error' });
    }
  };

  const handleApprove = async (data: FormData) => {
    setIsApproving(true);
    const review: Review = {
      reviewStatus: REVIEW_STATUSES.APPROVED,
      reviewComment: data.comment,
    };
    await updateReview(review);
    setIsApproving(false);
  };

  const handleReject = async (data: FormData) => {
    setIsRejecting(true);
    const review: Review = {
      reviewStatus: REVIEW_STATUSES.REJECTED,
      reviewComment: data.comment,
    };
    await updateReview(review);
    setIsRejecting(false);
  };

  return (
    <form>
      <Stack gap={2} py={1} px={3} mt={2} sx={{ borderTop: '1px solid #ccc' }}>
        <Controller
          name="comment"
          control={control}
          rules={{
            maxLength: {
              value: 500,
              message: 'Comment cannot exceed 500 characters',
            },
          }}
          render={({ field }) => (
            <TextField
              {...field}
              label="Comment (optional)"
              multiline
              rows={4}
              error={!!errors.comment}
              helperText={errors.comment?.message}
            />
          )}
        />

        <Stack direction="row" gap={2} justifyContent="end">
          <LoadingButton
            variant="contained"
            color="error"
            type="button"
            onClick={handleSubmit(handleReject)}
            loading={isRejecting}
            disabled={isApproving}
          >
            Reject
          </LoadingButton>
          <LoadingButton
            variant="contained"
            color="success"
            type="button"
            onClick={handleSubmit(handleApprove)}
            loading={isApproving}
            disabled={isRejecting}
          >
            Approve
          </LoadingButton>
        </Stack>
      </Stack>
    </form>
  );
}
