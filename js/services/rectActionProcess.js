// アクション選択 -> 部位番号登録
// アクション選択 -> 遷移先画像登録
export class RectActionProcess {
    constructor() {
        this.modals = document.querySelectorAll('.modal')
        // アクション選択
        this.actionSelectionModal = document.getElementById('action-selection-modal')
        this.actionSelectionCancelBtn = this.actionSelectionModal.querySelector('.cancel-btn')
        this.actionSelectionNextBtn = this.actionSelectionModal.querySelector('.next-btn')
        // 部位番号登録
        this.partNumberModal = document.getElementById('part-number-modal')
        this.partNumberCancelBtn = this.partNumberModal.querySelector('.cancel-btn')
        this.partNumberRegisterBtn = this.partNumberModal.querySelector('.register-btn')
        this.partNumberInput = this.partNumberModal.querySelector('#part-number-input')
        // 遷移先画像登録
        this.transitionImageModal = document.getElementById('transition-image-modal')
        this.transitionImageCancelBtn = this.transitionImageModal.querySelector('.cancel-btn')
        this.transitionImageRegisterBtn = this.transitionImageModal.querySelector('.register-btn')
        this.transitionImageInput = this.transitionImageModal.querySelector('#transition-image-input')

        this.rect = null // 選択している矩形の相対座標と登録ステータスを管理するステート

        this.onRegistrationSuccess = null // 登録成功時に呼び出すコールバック
        this.onRegistrationFailure = null // 登録失敗時に呼び出すコールバック

        this.setupEventListeners()
    }

    /**
     * モーダルを開いて矩形登録、削除プロセスを開始。
     * 成功、失敗、キャンセルの各シナリオに基づいて適切な処理を行い、
     * Promise を通じて結果を返す。
     *
     * @param {Object} targetRect - 処理対象の矩形データ。必要な矩形の情報を含むオブジェクト。
     * @returns {Promise<Object>}
     * 登録、削除が成功した場合、更新された矩形データを返す。
     * 登録、削除が失敗した場合、エラーを返す。
     * 登録、削除がキャンセルされた場合、矩形データを返す。
     */
    start(targetRect) {
        this.rect = targetRect
        this.openModal(this.actionSelectionModal)

        return new Promise((resolve, reject) => {
            this.onRegistrationSuccess = () => resolve(this.rect)
            this.onRegistrationFailure = (error) => reject(error)
        })
    }

    //
    // EventListener
    //
    setupEventListeners() {
        // アクション選択
        this.actionSelectionCancelBtn.addEventListener('click', () => this.handleRegistrationCancel())
        this.actionSelectionNextBtn.addEventListener('click', () => this.handleNext())
        this.setupSelectionTypeListeners()
        // 部位番号登録
        this.partNumberCancelBtn.addEventListener('click', () => this.handleModalClose(this.partNumberModal))
        this.partNumberRegisterBtn.addEventListener('click', () => this.handlePartNumberRegister())
        this.partNumberInput.addEventListener('input', () => {
            this.handleRegisterBtnEnable(this.partNumberInput, this.partNumberRegisterBtn)
        })
        // 遷移先画像登録
        this.transitionImageCancelBtn.addEventListener('click', () => this.handleModalClose(this.transitionImageModal))
        this.transitionImageRegisterBtn.addEventListener('click', () => this.handleTransitionImageRegister())
        this.transitionImageInput.addEventListener('input', () => {
            this.handleRegisterBtnEnable(this.transitionImageInput, this.transitionImageRegisterBtn)
        })
    }

    // 登録キャンセル時の処理
    handleRegistrationCancel() {
        this.resetActionSelectionModal()
        this.closeAllModals()
        if (this.onRegistrationSuccess) this.onRegistrationSuccess()
    }

    // アクション選択モーダルでアクションを選択後、次へボタンを押した後の処理
    // - 部位番号登録モーダルを開く
    // - 遷移先画像登録モーダルを開く
    // - 矩形を削除
    async handleNext() {
        const selectionType = this.actionSelectionModal.querySelector('input[name="selection-type"]:checked').value
        if (selectionType === 'part-number') {
            this.handleModalOpen(this.partNumberModal)
        } else if (selectionType === 'transition-image') {
            this.handleModalOpen(this.transitionImageModal)
        } else if (selectionType === 'delete-rect') {
            await this.handleRectDelete()
        }
    }

    // ラジオボタンの選択状態に応じて「次へ」ボタンを有効化する
    setupSelectionTypeListeners() {
        const selectionInputs = this.actionSelectionModal.querySelectorAll('input[name="selection-type"]')
        selectionInputs.forEach(input => {
            input.addEventListener('change', () => this.handleNextBtnEnable())
        })
    }

    handleNextBtnEnable() {
        if (document.querySelector('input[name="selection-type"]:checked')) {
            this.actionSelectionNextBtn.disabled = false
        } else {
            this.actionSelectionNextBtn.disabled = true
        }
    }

    handleModalOpen(targetModal) {
        this.openModal(targetModal)
    }

    handleModalClose(targetModal) {
        this.closeModal(targetModal)
    }

    // 部位番号登録モーダル ＆ 遷移先画像登録モーダル
    // 入力の有無に応じて登録ボタンの有効/無効を切り替える
    handleRegisterBtnEnable(inputElement, buttonElement) {
        if (inputElement.value.trim() !== '') {
            buttonElement.disabled = false
        } else {
            buttonElement.disabled = true
        }
    }

    // 部位番号の登録
    async handlePartNumberRegister() {
        try {
            console.log('部位番号を登録')
            console.log('矩形情報', this.rect)
            console.log('部位番号', this.partNumberInput.value)
            if (!this.rect.id) {
                // TODO: 部位番号新規登録 API
                // TODO: DBに登録後、APIから返って来るIDを想定して適当にセットしてます。API追加後、こちらも変更してください
                const created_rect_id = 999
                this.updateId(created_rect_id)
            } else {
                // TODO: 部位番号更新 API
            }

            this.updatePartNumber()
            this.processActionSuccess()
        } catch (err) {
            console.error('部位番号の登録失敗')
            this.processActionFailure(err)
        }
    }

    // 遷移先画像の登録
    async handleTransitionImageRegister() {
        try {
            console.log('遷移先画像を登録')
            console.log('矩形情報', this.rect)
            console.log('遷移先画像パス', this.transitionImageInput.value)
            if (!this.rect.id) {
                // TODO: 部位番号新規登録 API
                // TODO: DBに登録後、APIから返って来るIDを想定して適当にセットしてます。API追加後、こちらも変更してください
                const created_rect_id = 999
                this.updateId(created_rect_id)
            } else {
                // TODO: 部位番号更新 API
            }

            this.updateTransitionImagePath()
            this.processActionSuccess()
        } catch (err) {
            console.error('遷移先画像の登録失敗', err)
            this.processActionFailure(err)
        }
    }

    // 矩形の削除
    async handleRectDelete() {
        try {
            console.log('矩形を削除')
            console.log('矩形情報', this.rect)

            // ID がある場合は、DBからも矩形削除
            if (this.rect.id) {
                // TODO: 矩形削除 API
            }

            this.updateDeletedStatus()
            this.processActionSuccess()
        } catch (err) {
            console.error('矩形削除失敗', err)
            this.processActionFailure(err)
        }
    }

    //
    // モーダル開閉
    //
    openModal(targetModal) {
        this.modals.forEach(modal => {
            if (modal === targetModal) {
                modal.style.display = 'block'
                modal.classList.remove('inactive')
            } else {
                modal.classList.add('inactive')
            }
        })
    }

    closeModal(targetModal) {
        targetModal.style.display = 'none'
        this.modals.forEach(modal => modal.classList.remove('inactive'))
    }

    closeAllModals() {
        this.closeModal(this.partNumberModal)
        this.closeModal(this.transitionImageModal)
        this.closeModal(this.actionSelectionModal)
    }

    //
    // ステート管理 - rect の更新
    //
    updateId(id) {
        this.rect.id = id
    }

    updatePartNumber() {
        this.rect.partNumber = this.partNumberInput.value
    }

    updateTransitionImagePath() {
        this.rect.transitionImagePath = this.transitionImageInput.value
    }

    // 削除ステータスを更新する
    updateDeletedStatus() {
        this.rect.deleted = true
    }

    // TODO: Delete 後も呼び出されているので関数名を変更
    //
    // 登録、削除後の処理
    //
    // 登録、削除成功後の処理
    processActionSuccess() {
        this.resetPartNumberModal()
        this.resetTransitionImageModal()
        this.resetActionSelectionModal()
        this.closeAllModals()
        if (this.onRegistrationSuccess) this.onRegistrationSuccess()
    }

    // 登録、削除失敗後の処理
    processActionFailure(err) {
        if (this.onRegistrationFailure) this.onRegistrationFailure(err)
    }

    //
    // モーダル内の入力値のクリア
    //
    resetActionSelectionModal() {
        // ラジオボタンの選択を解除
        this.actionSelectionModal.querySelectorAll('input[name="selection-type"]').forEach(radio => {
            radio.checked = false
        })

        // 次へボタンを無効化
        this.actionSelectionNextBtn.disabled = true
    }

    resetPartNumberModal() {
        // テキスト入力フィールドをクリア
        this.partNumberInput.value = ''
    }

    resetTransitionImageModal() {
        // テキスト入力フィールドをクリア
        this.transitionImageInput.value = ''
    }
}
