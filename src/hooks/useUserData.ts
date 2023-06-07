import { useGetUserQuery } from '@/app/services/userApi';

const useUserData = () => {
    const { data, isSuccess } = useGetUserQuery(); // we need to check if data exists
    const adminData = data?.roles.admin;
    const superUserData = data?.roles.super_user;
    const isUserAuthorized = !!adminData || !!superUserData;
    console.log('the data is ', data);
    return { data, isUserAuthorized, isSuccess };
};

export default useUserData;
