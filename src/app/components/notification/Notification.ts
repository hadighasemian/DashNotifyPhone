import Swal from 'sweetalert2';
export  const Notify = (title:string='',color: any='danger') => {
    const toast = Swal.mixin({
        toast: true,
        position: 'top-start',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: {
            popup: `color-${color}`,
        },
    });
    toast.fire({
        title: title,
        toast: true,
        position: 'top-start',
        showConfirmButton: false,
        timer: 3000,
        showCloseButton: true,
        customClass: {
            popup: `color-${color}`,
        },
    });
};
