// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'problem_details_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

class _$ProblemDetailsDto extends ProblemDetailsDto {
  @override
  final String type;
  @override
  final String title;
  @override
  final int status;
  @override
  final String detail;
  @override
  final String instance;
  @override
  final String code;
  @override
  final BuiltList<String>? reasons;
  @override
  final String? requestId;
  @override
  final String? traceId;

  factory _$ProblemDetailsDto(
          [void Function(ProblemDetailsDtoBuilder)? updates]) =>
      (ProblemDetailsDtoBuilder()..update(updates))._build();

  _$ProblemDetailsDto._(
      {required this.type,
      required this.title,
      required this.status,
      required this.detail,
      required this.instance,
      required this.code,
      this.reasons,
      this.requestId,
      this.traceId})
      : super._();
  @override
  ProblemDetailsDto rebuild(void Function(ProblemDetailsDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  ProblemDetailsDtoBuilder toBuilder() =>
      ProblemDetailsDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is ProblemDetailsDto &&
        type == other.type &&
        title == other.title &&
        status == other.status &&
        detail == other.detail &&
        instance == other.instance &&
        code == other.code &&
        reasons == other.reasons &&
        requestId == other.requestId &&
        traceId == other.traceId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, type.hashCode);
    _$hash = $jc(_$hash, title.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, detail.hashCode);
    _$hash = $jc(_$hash, instance.hashCode);
    _$hash = $jc(_$hash, code.hashCode);
    _$hash = $jc(_$hash, reasons.hashCode);
    _$hash = $jc(_$hash, requestId.hashCode);
    _$hash = $jc(_$hash, traceId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'ProblemDetailsDto')
          ..add('type', type)
          ..add('title', title)
          ..add('status', status)
          ..add('detail', detail)
          ..add('instance', instance)
          ..add('code', code)
          ..add('reasons', reasons)
          ..add('requestId', requestId)
          ..add('traceId', traceId))
        .toString();
  }
}

class ProblemDetailsDtoBuilder
    implements Builder<ProblemDetailsDto, ProblemDetailsDtoBuilder> {
  _$ProblemDetailsDto? _$v;

  String? _type;
  String? get type => _$this._type;
  set type(String? type) => _$this._type = type;

  String? _title;
  String? get title => _$this._title;
  set title(String? title) => _$this._title = title;

  int? _status;
  int? get status => _$this._status;
  set status(int? status) => _$this._status = status;

  String? _detail;
  String? get detail => _$this._detail;
  set detail(String? detail) => _$this._detail = detail;

  String? _instance;
  String? get instance => _$this._instance;
  set instance(String? instance) => _$this._instance = instance;

  String? _code;
  String? get code => _$this._code;
  set code(String? code) => _$this._code = code;

  ListBuilder<String>? _reasons;
  ListBuilder<String> get reasons => _$this._reasons ??= ListBuilder<String>();
  set reasons(ListBuilder<String>? reasons) => _$this._reasons = reasons;

  String? _requestId;
  String? get requestId => _$this._requestId;
  set requestId(String? requestId) => _$this._requestId = requestId;

  String? _traceId;
  String? get traceId => _$this._traceId;
  set traceId(String? traceId) => _$this._traceId = traceId;

  ProblemDetailsDtoBuilder() {
    ProblemDetailsDto._defaults(this);
  }

  ProblemDetailsDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _type = $v.type;
      _title = $v.title;
      _status = $v.status;
      _detail = $v.detail;
      _instance = $v.instance;
      _code = $v.code;
      _reasons = $v.reasons?.toBuilder();
      _requestId = $v.requestId;
      _traceId = $v.traceId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(ProblemDetailsDto other) {
    _$v = other as _$ProblemDetailsDto;
  }

  @override
  void update(void Function(ProblemDetailsDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  ProblemDetailsDto build() => _build();

  _$ProblemDetailsDto _build() {
    _$ProblemDetailsDto _$result;
    try {
      _$result = _$v ??
          _$ProblemDetailsDto._(
            type: BuiltValueNullFieldError.checkNotNull(
                type, r'ProblemDetailsDto', 'type'),
            title: BuiltValueNullFieldError.checkNotNull(
                title, r'ProblemDetailsDto', 'title'),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'ProblemDetailsDto', 'status'),
            detail: BuiltValueNullFieldError.checkNotNull(
                detail, r'ProblemDetailsDto', 'detail'),
            instance: BuiltValueNullFieldError.checkNotNull(
                instance, r'ProblemDetailsDto', 'instance'),
            code: BuiltValueNullFieldError.checkNotNull(
                code, r'ProblemDetailsDto', 'code'),
            reasons: _reasons?.build(),
            requestId: requestId,
            traceId: traceId,
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'reasons';
        _reasons?.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'ProblemDetailsDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
