export default function StreamWindow({ STREAM_URL }: { STREAM_URL: string }) {
    return (
        <img
            src={`${STREAM_URL}`}
            width={640}
            height={360}
            alt="Interactive Stream"
            style={{ display: 'block' }}
        />
    );
}
