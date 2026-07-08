import { t, Trans } from '@lingui/macro';
import { Button } from 'antd';
import { DocumentReference, Encounter } from 'fhir/r4b';

import { ResourceListPageContent } from '@beda.software/emr/dist/uberComponents/ResourceListPageContent/index';
import { formatHumanDateTime } from '@beda.software/emr/dist/utils/index';
import { customAction } from '@beda.software/emr/uberComponents';

function openAttachmentPdf(data: string, contentType?: string) {
    const byteCharacters = atob(data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const blob = new Blob([new Uint8Array(byteNumbers)], { type: contentType || 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
}

function getDocumentTitle(resource: DocumentReference): string {
    return resource.type?.coding?.[0]?.display ?? resource.type?.text ?? resource.description ?? 'N/A';
}

export function EncounterDocuments({ encounter }: { encounter: Encounter }) {
    return (
        <ResourceListPageContent<DocumentReference>
            resourceType="DocumentReference"
            searchParams={{ encounter: encounter.id! }}
            getTableColumns={() => [
                {
                    title: t`Type`,
                    key: 'type',
                    render: (_text: any, { resource }) => getDocumentTitle(resource),
                },
                {
                    title: t`Status`,
                    key: 'status',
                    render: (_text: any, { resource }) => resource.status,
                },
                {
                    title: t`Date`,
                    key: 'date',
                    render: (_text: any, { resource }) => (resource.date ? formatHumanDateTime(resource.date) : 'N/A'),
                },
            ]}
            getRecordActions={({ resource }) => {
                const attachment = resource.content?.[0]?.attachment;
                if (!attachment?.data) {
                    return [];
                }

                return [
                    customAction(
                        <Button
                            type="link"
                            size="small"
                            onClick={() => openAttachmentPdf(attachment.data!, attachment.contentType)}
                        >
                            <Trans>View</Trans>
                        </Button>,
                    ),
                ];
            }}
            getReportColumns={(bundle) => [
                {
                    title: t`Number of Documents`,
                    value: bundle.total,
                },
            ]}
        />
    );
}
