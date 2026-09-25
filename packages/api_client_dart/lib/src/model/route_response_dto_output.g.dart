// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'route_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const RouteResponseDtoOutputStatusEnum
    _$routeResponseDtoOutputStatusEnum_ACTIVE =
    const RouteResponseDtoOutputStatusEnum._('ACTIVE');
const RouteResponseDtoOutputStatusEnum
    _$routeResponseDtoOutputStatusEnum_INACTIVE =
    const RouteResponseDtoOutputStatusEnum._('INACTIVE');

RouteResponseDtoOutputStatusEnum _$routeResponseDtoOutputStatusEnumValueOf(
    String name) {
  switch (name) {
    case 'ACTIVE':
      return _$routeResponseDtoOutputStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$routeResponseDtoOutputStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RouteResponseDtoOutputStatusEnum>
    _$routeResponseDtoOutputStatusEnumValues = BuiltSet<
        RouteResponseDtoOutputStatusEnum>(const <RouteResponseDtoOutputStatusEnum>[
  _$routeResponseDtoOutputStatusEnum_ACTIVE,
  _$routeResponseDtoOutputStatusEnum_INACTIVE,
]);

const RouteResponseDtoOutputMetricsSourceEnum
    _$routeResponseDtoOutputMetricsSourceEnum_GOONG =
    const RouteResponseDtoOutputMetricsSourceEnum._('GOONG');
const RouteResponseDtoOutputMetricsSourceEnum
    _$routeResponseDtoOutputMetricsSourceEnum_ESTIMATE =
    const RouteResponseDtoOutputMetricsSourceEnum._('ESTIMATE');

RouteResponseDtoOutputMetricsSourceEnum
    _$routeResponseDtoOutputMetricsSourceEnumValueOf(String name) {
  switch (name) {
    case 'GOONG':
      return _$routeResponseDtoOutputMetricsSourceEnum_GOONG;
    case 'ESTIMATE':
      return _$routeResponseDtoOutputMetricsSourceEnum_ESTIMATE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<RouteResponseDtoOutputMetricsSourceEnum>
    _$routeResponseDtoOutputMetricsSourceEnumValues = BuiltSet<
        RouteResponseDtoOutputMetricsSourceEnum>(const <RouteResponseDtoOutputMetricsSourceEnum>[
  _$routeResponseDtoOutputMetricsSourceEnum_GOONG,
  _$routeResponseDtoOutputMetricsSourceEnum_ESTIMATE,
]);

Serializer<RouteResponseDtoOutputStatusEnum>
    _$routeResponseDtoOutputStatusEnumSerializer =
    _$RouteResponseDtoOutputStatusEnumSerializer();
Serializer<RouteResponseDtoOutputMetricsSourceEnum>
    _$routeResponseDtoOutputMetricsSourceEnumSerializer =
    _$RouteResponseDtoOutputMetricsSourceEnumSerializer();

class _$RouteResponseDtoOutputStatusEnumSerializer
    implements PrimitiveSerializer<RouteResponseDtoOutputStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[RouteResponseDtoOutputStatusEnum];
  @override
  final String wireName = 'RouteResponseDtoOutputStatusEnum';

  @override
  Object serialize(
          Serializers serializers, RouteResponseDtoOutputStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RouteResponseDtoOutputStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RouteResponseDtoOutputStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RouteResponseDtoOutputMetricsSourceEnumSerializer
    implements PrimitiveSerializer<RouteResponseDtoOutputMetricsSourceEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'GOONG': 'GOONG',
    'ESTIMATE': 'ESTIMATE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'GOONG': 'GOONG',
    'ESTIMATE': 'ESTIMATE',
  };

  @override
  final Iterable<Type> types = const <Type>[
    RouteResponseDtoOutputMetricsSourceEnum
  ];
  @override
  final String wireName = 'RouteResponseDtoOutputMetricsSourceEnum';

  @override
  Object serialize(Serializers serializers,
          RouteResponseDtoOutputMetricsSourceEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  RouteResponseDtoOutputMetricsSourceEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      RouteResponseDtoOutputMetricsSourceEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$RouteResponseDtoOutput extends RouteResponseDtoOutput {
  @override
  final String id;
  @override
  final String name;
  @override
  final RouteResponseDtoOutputStatusEnum status;
  @override
  final int totalDistanceMeters;
  @override
  final int totalDurationSeconds;
  @override
  final RouteResponseDtoOutputMetricsSourceEnum metricsSource;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final String? note;
  @override
  final BuiltList<RouteResponseDtoOutputStopsInner> stops;

  factory _$RouteResponseDtoOutput(
          [void Function(RouteResponseDtoOutputBuilder)? updates]) =>
      (RouteResponseDtoOutputBuilder()..update(updates))._build();

  _$RouteResponseDtoOutput._(
      {required this.id,
      required this.name,
      required this.status,
      required this.totalDistanceMeters,
      required this.totalDurationSeconds,
      required this.metricsSource,
      required this.createdAt,
      required this.updatedAt,
      this.note,
      required this.stops})
      : super._();
  @override
  RouteResponseDtoOutput rebuild(
          void Function(RouteResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  RouteResponseDtoOutputBuilder toBuilder() =>
      RouteResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is RouteResponseDtoOutput &&
        id == other.id &&
        name == other.name &&
        status == other.status &&
        totalDistanceMeters == other.totalDistanceMeters &&
        totalDurationSeconds == other.totalDurationSeconds &&
        metricsSource == other.metricsSource &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        note == other.note &&
        stops == other.stops;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, totalDistanceMeters.hashCode);
    _$hash = $jc(_$hash, totalDurationSeconds.hashCode);
    _$hash = $jc(_$hash, metricsSource.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, stops.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'RouteResponseDtoOutput')
          ..add('id', id)
          ..add('name', name)
          ..add('status', status)
          ..add('totalDistanceMeters', totalDistanceMeters)
          ..add('totalDurationSeconds', totalDurationSeconds)
          ..add('metricsSource', metricsSource)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('note', note)
          ..add('stops', stops))
        .toString();
  }
}

class RouteResponseDtoOutputBuilder
    implements Builder<RouteResponseDtoOutput, RouteResponseDtoOutputBuilder> {
  _$RouteResponseDtoOutput? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  RouteResponseDtoOutputStatusEnum? _status;
  RouteResponseDtoOutputStatusEnum? get status => _$this._status;
  set status(RouteResponseDtoOutputStatusEnum? status) =>
      _$this._status = status;

  int? _totalDistanceMeters;
  int? get totalDistanceMeters => _$this._totalDistanceMeters;
  set totalDistanceMeters(int? totalDistanceMeters) =>
      _$this._totalDistanceMeters = totalDistanceMeters;

  int? _totalDurationSeconds;
  int? get totalDurationSeconds => _$this._totalDurationSeconds;
  set totalDurationSeconds(int? totalDurationSeconds) =>
      _$this._totalDurationSeconds = totalDurationSeconds;

  RouteResponseDtoOutputMetricsSourceEnum? _metricsSource;
  RouteResponseDtoOutputMetricsSourceEnum? get metricsSource =>
      _$this._metricsSource;
  set metricsSource(RouteResponseDtoOutputMetricsSourceEnum? metricsSource) =>
      _$this._metricsSource = metricsSource;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  ListBuilder<RouteResponseDtoOutputStopsInner>? _stops;
  ListBuilder<RouteResponseDtoOutputStopsInner> get stops =>
      _$this._stops ??= ListBuilder<RouteResponseDtoOutputStopsInner>();
  set stops(ListBuilder<RouteResponseDtoOutputStopsInner>? stops) =>
      _$this._stops = stops;

  RouteResponseDtoOutputBuilder() {
    RouteResponseDtoOutput._defaults(this);
  }

  RouteResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _name = $v.name;
      _status = $v.status;
      _totalDistanceMeters = $v.totalDistanceMeters;
      _totalDurationSeconds = $v.totalDurationSeconds;
      _metricsSource = $v.metricsSource;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _note = $v.note;
      _stops = $v.stops.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(RouteResponseDtoOutput other) {
    _$v = other as _$RouteResponseDtoOutput;
  }

  @override
  void update(void Function(RouteResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  RouteResponseDtoOutput build() => _build();

  _$RouteResponseDtoOutput _build() {
    _$RouteResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$RouteResponseDtoOutput._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'RouteResponseDtoOutput', 'id'),
            name: BuiltValueNullFieldError.checkNotNull(
                name, r'RouteResponseDtoOutput', 'name'),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'RouteResponseDtoOutput', 'status'),
            totalDistanceMeters: BuiltValueNullFieldError.checkNotNull(
                totalDistanceMeters,
                r'RouteResponseDtoOutput',
                'totalDistanceMeters'),
            totalDurationSeconds: BuiltValueNullFieldError.checkNotNull(
                totalDurationSeconds,
                r'RouteResponseDtoOutput',
                'totalDurationSeconds'),
            metricsSource: BuiltValueNullFieldError.checkNotNull(
                metricsSource, r'RouteResponseDtoOutput', 'metricsSource'),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'RouteResponseDtoOutput', 'createdAt'),
            updatedAt: BuiltValueNullFieldError.checkNotNull(
                updatedAt, r'RouteResponseDtoOutput', 'updatedAt'),
            note: note,
            stops: stops.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'stops';
        stops.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'RouteResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
