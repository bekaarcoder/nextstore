import loader from '@/assets/loader.gif';
import Image from 'next/image';

const LoadingPage = () => {
    return (
        <div className="flex h-screen justify-center items-center w-screen">
            <Image src={loader} height={60} width={60} alt="Loading..." />
        </div>
    );
};

export default LoadingPage;
