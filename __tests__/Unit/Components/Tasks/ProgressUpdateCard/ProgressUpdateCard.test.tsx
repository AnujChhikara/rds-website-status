import moment from 'moment';
import { Provider } from 'react-redux';
import { fireEvent, screen } from '@testing-library/react';
import { store } from '@/app/store';
import { renderWithRouter } from '@/test_utils/createMockRouter';
import { mockGetTaskProgress } from '../../../../../__mocks__/db/progresses';
import ProgressUpdateCard from '@/components/taskDetails/ProgressUpdateCard/ProgressUpdateCard';
import { DEFAULT_AVATAR, USER_MANAGEMENT_URL } from '@/constants/url';
import { useRouter } from 'next/router';
jest.mock('next/router', () => ({
    useRouter: jest.fn(),
}));

let mockedOpenDetailsFunction: jest.Mock<void, [React.MouseEvent<HTMLElement>]>;

beforeEach(() => {
    mockedOpenDetailsFunction =
        jest.fn<void, [React.MouseEvent<HTMLElement>]>();
});

describe('ProgressUpdateCard Component', () => {
    it('should render the default avatar and username when userData is undefined', () => {
        const mockRouter = {
            query: { dev: 'true' },
        };
        (useRouter as jest.Mock).mockReturnValue(mockRouter);

        const mockDataWithNoUserData = {
            ...mockGetTaskProgress.data[2],
            userData: undefined,
        };

        renderWithRouter(
            <Provider store={store()}>
                <ProgressUpdateCard data={mockDataWithNoUserData} />
            </Provider>
        );
        const userInfoContainer = screen.getByTestId(
            'progress-update-card-user-info-container'
        );
        expect(userInfoContainer).toBeInTheDocument();
        const usernameLink = screen.getByRole('link', { name: 'Avatar' });
        expect(usernameLink).toHaveAttribute(
            'href',
            `${USER_MANAGEMENT_URL}?username=`
        );

        const profilePicture = screen.getByTestId(
            'progress-update-card-profile-picture'
        );
        expect(profilePicture).toHaveAttribute('src', DEFAULT_AVATAR);
    });

    it('should toggle the expanded state when the card is clicked', () => {
        renderWithRouter(
            <Provider store={store()}>
                <ProgressUpdateCard data={mockGetTaskProgress.data[2]} />
            </Provider>
        );

        const progressUpdateCardContainer = screen.getByTestId(
            'progress-update-card-container'
        );

        // Initial state
        expect(progressUpdateCardContainer).not.toHaveClass('expand');

        // Click to expand
        fireEvent.click(progressUpdateCardContainer);
        expect(progressUpdateCardContainer).toHaveClass('expand');

        // Click to collapse
        fireEvent.click(progressUpdateCardContainer);
        expect(progressUpdateCardContainer).not.toHaveClass('expand');
    });

    it('should check if the onCardClick function is called when user click on card', () => {
        renderWithRouter(
            <Provider store={store()}>
                <ProgressUpdateCard data={mockGetTaskProgress.data[2]} />
            </Provider>
        );
        const progressUpdateCardContainer = screen.getByTestId(
            'progress-update-card-container'
        );
        fireEvent.click(progressUpdateCardContainer);
        expect(progressUpdateCardContainer).toHaveClass(
            'progress-update-card__container expand'
        );
    });

    it('should toggle "Read More" state when the button is clicked', () => {
        const mockLongCompletedData = {
            ...mockGetTaskProgress.data[2],
            completed:
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin lacinia bibendum nisi at feugiat.',
        };

        renderWithRouter(
            <Provider store={store()}>
                <ProgressUpdateCard data={mockLongCompletedData} />
            </Provider>
        );

        const readMoreButton = screen.getByTestId(
            'progress-update-card-read-more-completed'
        );
        expect(readMoreButton).toBeInTheDocument();
        expect(readMoreButton).toHaveTextContent('More');
        fireEvent.click(readMoreButton);
        expect(readMoreButton).toHaveTextContent('Less');

        fireEvent.click(readMoreButton);

        expect(readMoreButton).toHaveTextContent('More');
    });

    it('should render completed section string as title in card', () => {
        renderWithRouter(
            <Provider store={store()}>
                <ProgressUpdateCard
                    data={mockGetTaskProgress.data[2]}
                    openDetails={mockedOpenDetailsFunction}
                />
            </Provider>
        );

        const cardTitle = screen.getByRole('heading');
        expect(cardTitle).toHaveTextContent(
            mockGetTaskProgress.data[2].completed
        );
    });

    it('should render date with ago format', () => {
        renderWithRouter(
            <Provider store={store()}>
                <ProgressUpdateCard
                    data={mockGetTaskProgress.data[2]}
                    openDetails={mockedOpenDetailsFunction}
                />
            </Provider>
        );
        const dateInAgoFormat = moment(
            mockGetTaskProgress.data[2].createdAt
        ).fromNow();
        const date = screen.getByTestId('progress-update-card-date');

        expect(date).toHaveTextContent(dateInAgoFormat);
    });

    it('should render the tooltip on hover on the date and should not render on mouse out off date', () => {
        renderWithRouter(
            <Provider store={store()}>
                <ProgressUpdateCard
                    data={mockGetTaskProgress.data[2]}
                    openDetails={mockedOpenDetailsFunction}
                />
            </Provider>
        );

        const momentDate = moment(mockGetTaskProgress.data[2].createdAt);
        const fullDate = momentDate.format(
            'dddd, MMMM DD, YYYY, hh:mm A [GMT] Z'
        );
        const tooltipString = `Updated at ${fullDate}`;
        const dateElement = screen.getByTestId('progress-update-card-date');

        fireEvent.mouseOver(dateElement);

        const tooltip = screen.getByTestId('tooltip');

        expect(tooltip).toHaveClass('fade-in');
        expect(tooltip).toHaveTextContent(tooltipString);

        fireEvent.mouseOut(dateElement);

        expect(tooltip).toHaveClass('fade-out');
    });
});
