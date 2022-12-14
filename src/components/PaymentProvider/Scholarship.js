/* eslint-disable react/prop-types */
import React, { useState } from 'react';
import {
  Box,
  Button,
  Text,
  TextInput,
} from '@codeday/topo/Atom';
import { apiFetch, useAnalytics } from '@codeday/topo/utils';
import { print } from 'graphql';
import { Select, useToast } from '@chakra-ui/react';
import { useTranslation } from 'next-i18next';
import { ScholarshipMutation } from '../RegisterForm.gql';

export default function ScholarshipBox({
  event, ticketsData, guardianData, finalPrice, isValid, onComplete, ...rest
}) {
  const [scholarshipReason, setScholarshipReason] = useState('');
  const [scholarshipReasonOther, setScholarshipReasonOther] = useState(null);
  const toast = useToast();
  const analytics = useAnalytics();
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation('Scholarship');
  const ready = scholarshipReason && (scholarshipReason !== 'OTHER' || scholarshipReasonOther) && isValid;
  const expectedPrice = finalPrice * ticketsData.length;

  return (
    <Box shadow="md" rounded="sm" borderWidth={1} p={4} {...rest}>
      <Text fontWeight="bold">{t('reason.question')}</Text>
      <Select placeholder=" " onChange={(e) => setScholarshipReason(e.target.value)} default>
        <option value="FAMILY_CANT_AFFORD">{t('reason.FAMILY_CANT_AFFORD')}</option>
        <option value="CANT_AFFORD">{t('reason.CANT_AFFORD')}</option>
        <option value="FAMILY_UNSURE">{t('reason.FAMILY_UNSURE')}</option>
        <option value="DONT_BELIEVE_PAY">{t('reason.DONT_BELIEVE_PAY')}</option>
        <option value="OTHER">{t('reason.OTHER')}</option>
      </Select>
      {scholarshipReason === 'OTHER' && (
        <>
          <Text fontWeight="bold" mt={4}>{t('reason.other-prompt')}</Text>
          <TextInput onChange={(e) => setScholarshipReasonOther(e.target.value)} value={scholarshipReasonOther} />
        </>
      )}
      <Button
        mt={4}
        rounded={0}
        w="100%"
        colorScheme={ready ? 'green' : 'gray'}
        disabled={!ready}
        isLoading={isLoading}
        onClick={async () => {
          setIsLoading(true);
          analytics.goal('MRELY0XP', 0);
          try {
            await apiFetch(print(ScholarshipMutation), {
              eventId: event.id,
              ticketsData,
              guardianData: guardianData || undefined,
              scholarshipReason,
              scholarshipReasonOther,
            });

            onComplete(true);
          } catch (ex) {
            toast({
              status: 'error',
              title: 'Error',
              description: ex.response?.errors
                ? ex.response.errors.map((error) => error.message).join(' ')
                : ex.toString(),
            });
          }
          setIsLoading(false);
        }}
      >
        {ready
          ? t('confirm-button', { currencySymbol: event.region.currencySymbol || '$', price: expectedPrice.toFixed(2) })
          : t('common:fill-required')}
      </Button>
    </Box>
  );
}
